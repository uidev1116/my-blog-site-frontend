import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';

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

    it('プレビューページは、Referer を送らず、検索エンジンに載せない', () => {
      expect(headers).toMatch(
        /^\/blog\/preview\/\*\r?\n(\s+[^\n]+\n)*?\s+Referrer-Policy: no-referrer/m,
      );
      expect(headers).toMatch(
        /^\/blog\/preview\/\*\r?\n(\s+[^\n]+\n)*?\s+X-Robots-Tag: noindex, nofollow/m,
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

    it('Worker は /api/* だけを処理し、それ以外は静的アセットを直接返す', () => {
      expect(config.main).toBe('worker/index.ts');
      expect(config.assets.run_worker_first).toEqual(['/api/*']);
    });

    it('デプロイでダッシュボードの変数を消さない(keep_vars)', () => {
      expect(config.keep_vars).toBe(true);
    });

    it('process.env から環境変数を読めるよう nodejs_compat を有効にする', () => {
      expect(config.compatibility_flags).toContain('nodejs_compat');
    });

    it('OpenNext 用の設定(IMAGES バインディング、.open-next の main)を持たない', () => {
      expect(config.images).toBeUndefined();
      expect(String(config.main ?? '')).not.toContain('.open-next');
    });
  });

  describe('デプロイのワークフロー(.github/workflows/deploy-cloudflare.yml)', () => {
    type Step = { name?: string; run?: string; env?: Record<string, string> };
    const workflow = parseYaml(
      read(path.join(root, '.github/workflows/deploy-cloudflare.yml')),
    );
    const job = workflow.jobs.deploy;
    const steps: Step[] = job.steps;
    const deployStep = steps.find((step) => step.name === 'Deploy') as Step;
    // --var を組み立てるループ(for name in A B C; do ... value=...)の、変数名の一覧
    const passedVars =
      [
        ...(deployStep.run ?? '').matchAll(
          /for name in ([^;]+); do\s*\n\s*value=/g,
        ),
      ]
        .pop()?.[1]
        .split(/\s+/) ?? [];

    it('手動、a-blog cms の更新通知、定期実行(Zenn の更新の反映)で動く', () => {
      expect(workflow.on).toHaveProperty('workflow_dispatch');
      expect(workflow.on.repository_dispatch.types).toEqual([
        'acms-content-updated',
      ]);
      expect(workflow.on.schedule).toHaveLength(1);
      expect(workflow.on.schedule[0].cron).toMatch(/^\S+ \S+ \S+ \S+ \S+$/);
    });

    it('同時に複数のデプロイを走らせず、実行中のデプロイを途中で止めない', () => {
      expect(workflow.concurrency.group).toBe('deploy-cloudflare');
      expect(workflow.concurrency['cancel-in-progress']).toBe(false);
    });

    it('変数が未設定のときは、定期実行・通知からの実行を、黙ってスキップする(手動実行は、そのまま動かして失敗を見せる)', () => {
      expect(job.if).toContain("github.event_name == 'workflow_dispatch'");
      expect(job.if).toContain("vars.NEXT_PUBLIC_BASE_URL != ''");
    });

    it('master をデプロイし、production の Environment を使い、権限は読み取りだけ', () => {
      const checkout = steps.find((step) =>
        String((step as { uses?: string }).uses).startsWith('actions/checkout'),
      ) as { with?: { ref?: string } };
      expect(checkout.with?.ref).toBe('master');
      expect(job.environment).toBe('production');
      expect(workflow.permissions).toEqual({ contents: 'read' });
    });

    it('Secret は、Deploy のステップにだけ渡す(ジョブ全体の env や、npm ci / npm test に渡さない)', () => {
      const secretKeys = (env: Record<string, string> = {}) =>
        Object.keys(env).filter((key) => /KEY|TOKEN/.test(key));

      expect(secretKeys(job.env)).toEqual([]);
      for (const step of steps.filter((s) => s !== deployStep)) {
        expect(secretKeys(step.env)).toEqual([]);
      }
      expect(secretKeys(deployStep.env).sort()).toEqual([
        'ACMS_API_KEY',
        'ACMS_API_PREVIEW_KEY',
        'CLOUDFLARE_API_TOKEN',
      ]);
    });

    it('Worker が実行時に読む変数(Secret 以外)を、デプロイで --var として渡す', () => {
      expect([...passedVars].sort()).toEqual([
        'ACMS_API_HOSTNAME',
        'ACMS_API_PORT',
        'ACMS_API_PROTOCOL',
        'ACMS_ASSETS_HOSTNAME',
        'ACMS_ASSETS_PORT',
        'ACMS_ASSETS_PROTOCOL',
        'NEXT_PUBLIC_BASE_URL',
      ]);
      expect(deployStep.run).toContain('--var');
    });

    it('Secret を --var で渡さない(Worker の Secret は wrangler secret put で別に登録する)', () => {
      expect(passedVars.some((name) => /KEY|TOKEN/.test(name))).toBe(false);
    });

    it('必須の変数が空なら、デプロイせずに失敗する', () => {
      expect(deployStep.run).toMatch(/exit 1/);
      for (const name of [
        'NEXT_PUBLIC_BASE_URL',
        'ACMS_API_PROTOCOL',
        'ACMS_API_HOSTNAME',
        'ACMS_ASSETS_PROTOCOL',
        'ACMS_ASSETS_HOSTNAME',
      ]) {
        expect(deployStep.run).toContain(name);
      }
    });

    it('npm run deploy に --var を渡す。deploy は、最後に wrangler deploy を実行する(引数が末尾に付くため)', () => {
      expect(deployStep.run).toMatch(/npm run deploy -- /);
      const { scripts } = JSON.parse(read(path.join(root, 'package.json')));
      expect(scripts.deploy).toMatch(/&& wrangler deploy$/);
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
