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
    // ビルドとデプロイは Cloudflare(Workers Builds)で行い、このワークフローは、Deploy Hook を呼ぶだけ
    type Step = { name?: string; run?: string; env?: Record<string, string> };
    const source = read(
      path.join(root, '.github/workflows/deploy-cloudflare.yml'),
    );
    const workflow = parseYaml(source);
    const job = workflow.jobs.deploy;
    const steps: Step[] = job.steps;
    const hookStep = steps.find(
      (step) => step.name === 'Trigger build',
    ) as Step;

    it('手動、a-blog cms 以外のシステムからの通知、定期実行(Zenn の更新の反映)で動く', () => {
      expect(workflow.on).toHaveProperty('workflow_dispatch');
      expect(workflow.on.repository_dispatch.types).toEqual([
        'acms-content-updated',
      ]);
      expect(workflow.on.schedule).toHaveLength(1);
      expect(workflow.on.schedule[0].cron).toMatch(/^\S+ \S+ \S+ \S+ \S+$/);
    });

    it('同時に複数を走らせない(Deploy Hook 側でも、重複するビルドはまとめられる)', () => {
      expect(workflow.concurrency.group).toBe('deploy-cloudflare');
      expect(workflow.concurrency['cancel-in-progress']).toBe(false);
    });

    it('ジョブは、リポジトリのコードを取得せず、依存もインストールせず、権限も持たない', () => {
      expect(JSON.stringify(steps)).not.toContain('actions/checkout');
      expect(JSON.stringify(steps)).not.toContain('npm ');
      expect(workflow.permissions).toEqual({});
    });

    it('Secret は、Deploy Hook の URL だけ。Cloudflare の API トークンや a-blog cms のキーは、GitHub に置かない', () => {
      expect(job.environment).toBe('production');
      expect(source).toContain('secrets.CLOUDFLARE_DEPLOY_HOOK_URL');
      expect(source).not.toMatch(
        /secrets\.(CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|ACMS_)/,
      );
      expect(source).not.toMatch(/vars\./);
    });

    it('Hook の URL は、環境変数として渡し、コマンドに直接書かない', () => {
      expect(hookStep.env).toEqual(
        expect.objectContaining({
          HOOK_URL: '${{ secrets.CLOUDFLARE_DEPLOY_HOOK_URL }}',
        }),
      );
      expect(hookStep.run).toContain('"$HOOK_URL"');
      expect(hookStep.run).not.toContain('secrets.');
    });

    it('Hook に POST する(ヘッダー不要)。失敗(4xx / 5xx)や success: false なら、ジョブを失敗させる', () => {
      expect(hookStep.run).toMatch(/curl[^\n]*-X POST/);
      expect(hookStep.run).toMatch(/curl[^\n]*(-f|--fail)/);
      expect(hookStep.run).toMatch(/\.success == true/);
    });

    it('Hook の URL が未設定の間は、定期実行・通知からの実行は、黙ってスキップする。手動実行は失敗させる', () => {
      expect(hookStep.env?.EVENT_NAME).toBe('${{ github.event_name }}');
      expect(hookStep.run).toMatch(/-z "\$HOOK_URL"/);
      expect(hookStep.run).toContain('workflow_dispatch');
      expect(hookStep.run).toMatch(/exit 1/);
      expect(hookStep.run).toMatch(/exit 0/);
    });

    it('Hook のレスポンスの、ビルド ID だけを表示する(URL やレスポンス全体は出さない)', () => {
      expect(hookStep.run).toContain('build_uuid');
      expect(hookStep.run).not.toMatch(/echo "?\$HOOK_URL/);
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

describe('ads.txt(Google AdSense)', () => {
  it('サイトのルートに、AdSense のパブリッシャー ID を宣言する', () => {
    expect(read(path.join(root, 'public/ads.txt')).trim()).toBe(
      'google.com, pub-1916494680308477, DIRECT, f08c47fec0942fa0',
    );
  });
});
