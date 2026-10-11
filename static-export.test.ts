import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = __dirname;
const appDir = path.join(root, 'app');
const require = createRequire(import.meta.url);

function collect(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory()
      ? collect(full)
      : /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)
        ? [full]
        : [];
  });
}

const read = (file: string) => readFileSync(file, 'utf-8');

// コメントを除いたソース(コメントに書いた禁止語で誤検知しないため)
const code = (file: string) =>
  read(file)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

// jsonc のコメントと末尾カンマを除去して読み込む(wrangler.jsonc にはURL文字列がないため単純除去で足りる)
function readJsonc(file: string) {
  const text = read(path.join(root, file))
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(text);
}

// 静的書き出し(output: 'export')で Cloudflare の静的アセットとして配信する構成の制約
describe('静的書き出し + Cloudflare 静的アセット', () => {
  describe('next.config.js', () => {
    const config = require('./next.config.js');
    const resolved =
      typeof config === 'function' ? config('phase-production-build') : config;

    it('output: export で、末尾スラッシュ付きの URL を維持する', () => {
      expect(resolved.output).toBe('export');
      expect(resolved.trailingSlash).toBe(true);
    });

    it('画像の最適化サーバーは使わない(標準の loader は書き出しで使えない)', () => {
      expect(resolved.images.unoptimized).toBe(true);
    });

    it('redirects() は使わない(書き出しでは動かないため public/_redirects に書く)', () => {
      expect(resolved.redirects).toBeUndefined();
    });
  });

  describe('public/_redirects', () => {
    const file = path.join(root, 'public/_redirects');
    const redirects = existsSync(file) ? read(file) : '';

    it('旧記事 URL のリダイレクトを含む', () => {
      expect(redirects).toMatch(
        /^\/blog\/entry-106\.html\s+\/blog\/ablogcms-next-rss-feed\.html\/?\s+301$/m,
      );
    });

    it('廃止した検索ページの旧 URL(/blog/search/page/N/)を検索ページに転送する', () => {
      expect(redirects).toMatch(
        /^\/blog\/search\/page\/\*\s+\/blog\/search\/\s+301$/m,
      );
    });

    it('RSS フィードの旧 URL(/feed, /feed/)を feed.xml に転送する', () => {
      expect(redirects).toMatch(/^\/feed\s+\/feed\.xml\s+301$/m);
      expect(redirects).toMatch(/^\/feed\/\s+\/feed\.xml\s+301$/m);
    });
  });

  describe('public/_headers', () => {
    const file = path.join(root, 'public/_headers');
    const headers = existsSync(file) ? read(file) : '';

    it('拡張子のない OGP 画像に Content-Type: image/png を付ける', () => {
      expect(headers).toMatch(
        /^\/blog\/\*\/opengraph-image\r?\n\s+Content-Type: image\/png$/m,
      );
    });

    it('ハッシュ付きの /_next/static を長期キャッシュする', () => {
      expect(headers).toMatch(
        /^\/_next\/static\/\*\r?\n\s+Cache-Control: public, max-age=31536000, immutable$/m,
      );
    });
  });

  describe('wrangler.jsonc', () => {
    const config = readJsonc('wrangler.jsonc');

    it('ビルド出力(out)を静的アセットとして配信し、404 は 404.html を返す', () => {
      expect(config.assets.directory).toBe('./out');
      expect(config.assets.not_found_handling).toBe('404-page');
    });

    it('OpenNext 用の設定(IMAGES バインディング、.open-next の main)を持たない', () => {
      expect(config.images).toBeUndefined();
      expect(String(config.main ?? '')).not.toContain('.open-next');
    });
  });

  describe('app/ のソース', () => {
    const files = collect(appDir);

    it('Edge runtime を指定していない', () => {
      const offenders = files.filter((f) =>
        /export\s+const\s+runtime\s*=\s*['"]edge['"]/.test(code(f)),
      );
      expect(offenders).toEqual([]);
    });

    it('リクエスト時にしか決まらない機能(force-dynamic / draftMode / cookies / headers)を使っていない', () => {
      const offenders = files.filter((f) =>
        /force-dynamic|draftMode\s*\(|\bcookies\s*\(|\bheaders\s*\(/.test(
          code(f),
        ),
      );
      expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
    });

    it('動的セグメントのルートは、同じ階層か親の階層で generateStaticParams を持つ', () => {
      const targets = files.filter(
        (f) =>
          f.includes(`${path.sep}[`) &&
          /(page|route|opengraph-image)\.tsx?$/.test(f),
      );
      const offenders = targets.filter((target) => {
        let dir = path.dirname(target);
        while (dir.startsWith(appDir)) {
          const hasIt = readdirSync(dir)
            .filter((n) => /\.(ts|tsx)$/.test(n) && !/\.test\./.test(n))
            .some((n) =>
              code(path.join(dir, n)).includes('generateStaticParams'),
            );
          if (hasIt) return false;
          dir = path.dirname(dir);
        }
        return true;
      });
      expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
    });
  });
});
