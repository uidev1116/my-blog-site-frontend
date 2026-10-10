import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '..');

function collect(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory()
      ? collect(full)
      : /\.(ts|tsx)$/.test(name)
        ? [full]
        : [];
  });
}

// jsonc のコメントと末尾カンマを除去して読み込む(wrangler.jsonc にはURL文字列がないため単純除去で足りる)
function readJsonc(file: string) {
  const text = readFileSync(path.join(root, file), 'utf-8')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(text);
}

describe('Cloudflare Workers (OpenNext) 互換性', () => {
  it('OpenNext は Node.js runtime 前提のため、Edge runtime を指定していない', () => {
    const offenders = collect(path.join(root, 'app')).filter((file) =>
      /export\s+const\s+runtime\s*=\s*['"]edge['"]/.test(
        readFileSync(file, 'utf-8'),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it('wrangler.jsonc が OpenNext の出力を指している', () => {
    const config = readJsonc('wrangler.jsonc');
    expect(config.main).toBe('.open-next/worker.js');
    expect(config.assets.directory).toBe('.open-next/assets');
    expect(config.assets.binding).toBe('ASSETS');
    expect(config.compatibility_flags).toContain('nodejs_compat');
  });

  it('next/image の最適化用に IMAGES バインディングがある', () => {
    const config = readJsonc('wrangler.jsonc');
    expect(config.images?.binding).toBe('IMAGES');
  });

  it('open-next.config.ts が存在する(CIで対話プロンプトを出さないため)', () => {
    expect(() =>
      readFileSync(path.join(root, 'open-next.config.ts'), 'utf-8'),
    ).not.toThrow();
  });

  it('next のバージョンが @opennextjs/cloudflare の peer 要件を満たす(>=16.3.8)', () => {
    const { version } = JSON.parse(
      readFileSync(path.join(root, 'node_modules/next/package.json'), 'utf-8'),
    );
    const [major, minor, patch] = version.split('.').map(Number);
    const ok =
      major > 16 ||
      (major === 16 && (minor > 3 || (minor === 3 && patch >= 8)));
    expect(ok).toBe(true);
  });

  it('next.config.js は本番ビルド時に設定を返す(workerd を起動しない)', async () => {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const factory = require('../next.config.js');
    const config = factory('phase-production-build');
    expect(config.trailingSlash).toBe(true);
    expect(config.images.remotePatterns).toHaveLength(1);
  });
});
