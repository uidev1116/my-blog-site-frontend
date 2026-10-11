# Cloudflare へのデプロイ(静的書き出し + 静的アセット)

Next.js を **静的書き出し(`output: 'export'`)** でビルドし、`out/` を Cloudflare の **静的アセット**として配信する。HTML は Worker を通らず、静的ファイルとして直接返る(配信は無料・無制限、CPU 制限も関係しない)。

動的な処理(検索 API、プレビュー)だけを、小さな Worker として `worker/` に置く。`wrangler.jsonc` の `assets.run_worker_first: ["/api/*"]` で、`/api/*` だけが Worker に届き、それ以外は静的ファイルが直接返る(Worker は動かない)。

> OpenNext(`@opennextjs/cloudflare`)は使わない。OpenNext では、静的ページも Worker 経由で配信され、1 リクエストあたり 30〜80 ミリ秒の CPU を使うため、無料プランの上限(10 ミリ秒)を超えた(`wrangler tail` で計測)。

## 構成

| ファイル                | 役割                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.js`        | `output: 'export'`、`trailingSlash`、`images.unoptimized`                                                                                                                                                                                                                                                                     |
| `worker/index.ts`       | Worker。`GET /api/blog/?keyword=...&page=N`(検索・一覧。`keyword` と `page` だけを a-blog cms に渡す)。`app/blog/api` を再利用する。範囲外のページは 0 件で返す。成功は `max-age=60`、エラーは `no-store`。カスタムドメインのゾーン上では、Cache API でエッジにもキャッシュする(workers.dev では使えず、キャッシュなしで動く) |
| `worker/preview.ts`     | 下書きのプレビュー(「下書きのプレビュー」の節)。`/api/blog/draft/` と `/api/blog/preview/`。`worker/index.ts` がルーティングし、`worker/http.ts` の `json()` が共通のヘッダー(`no-store`、`nosniff`、`Referrer-Policy: no-referrer`)を付ける                                                                                  |
| `wrangler.jsonc`        | `out/` を静的アセットとして配信。存在しない URL は `404.html` を返す                                                                                                                                                                                                                                                          |
| `public/_redirects`     | リダイレクト(旧記事 URL、`/feed` → `/feed.xml`)。`next.config.js` の `redirects()` は書き出しで動かない                                                                                                                                                                                                                       |
| `public/_headers`       | 拡張子のない OGP 画像の `Content-Type`、`/_next/static` の長期キャッシュ                                                                                                                                                                                                                                                      |
| `static-export.test.ts` | 上記の構成と、書き出しで使えない機能(`force-dynamic`、`draftMode` など)を使っていないことのテスト                                                                                                                                                                                                                             |

## コマンド

| コマンド          | 内容                                                      |
| ----------------- | --------------------------------------------------------- |
| `npm run build`   | 静的書き出し(`out/`)。ビルド時に a-blog cms の API を呼ぶ |
| `npm run preview` | ビルドして、ローカルの workerd で配信する(`wrangler dev`) |
| `npm run deploy`  | ビルドして、Cloudflare にデプロイする(`wrangler deploy`)  |
| `npm test`        | Vitest(方針は `docs/testing.md`)                          |

CLI は Wrangler 4.x を使う。Cloudflare の新 CLI `cf`(2026/9 にオープンベータ公開)は、JS の Workers では Wrangler に処理を任せる設計のため、安定版が出るまでは Wrangler を使う。

## 環境変数

ビルド時(静的書き出し)と、Worker の実行時の両方で必要(値はダッシュボード / GitHub の設定で管理する)。ダッシュボードで設定した変数は、`keep_vars: true` のため、デプロイしても消えない(Secret はもともと消えない)。

| 変数                                                                 | 種別       |
| -------------------------------------------------------------------- | ---------- |
| `NEXT_PUBLIC_BASE_URL`                                               | 変数       |
| `ACMS_API_PROTOCOL` / `ACMS_API_HOSTNAME` / `ACMS_API_PORT`          | 変数       |
| `ACMS_API_KEY`                                                       | **Secret** |
| `ACMS_API_PREVIEW_KEY`                                               | **Secret** |
| `ACMS_ASSETS_PROTOCOL` / `ACMS_ASSETS_HOSTNAME` / `ACMS_ASSETS_PORT` | 変数       |

## 静的書き出しで変わったこと

| 以前(Vercel / OpenNext)                         | 今                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 記事の更新は再デプロイで反映                    | 同じ(再ビルド・再デプロイで反映)                                                                   |
| `/blog/zenn` の 1 時間 ISR                      | 定期的な再ビルド(6 時間ごと)で代替                                                                 |
| OGP 画像が 10 秒ごとに更新                      | ビルド時に全記事分を生成(`opengraph-image`)                                                        |
| `/feed/`                                        | `/feed.xml`(`/feed` と `/feed/` は 301 で転送)                                                     |
| `next/image` の最適化                           | なし(元の画像をそのまま配信)。Cloudflare Images を使うには、ドメインを Cloudflare に置く必要がある |
| 検索(SSR)、`/api/blog`、プレビュー(`draftMode`) | 静的ページ + Worker の API に作り直した(下記)                                                      |

## 下書きのプレビュー

a-blog cms のプレビューリンク(`/api/blog/draft/?previewKey=...&code=...`)は、URL を変えずに使える。

1. `GET /api/blog/draft/`(Worker): `previewKey`(`ACMS_API_PREVIEW_KEY` と一致)と `code`(`[A-Za-z0-9._~-]` の 200 文字まで)を検証し、記事が存在すれば、署名付きの Cookie(`preview`、30 分、`HttpOnly; Secure; SameSite=Lax; Path=/api/blog/preview`)を発行して、`/blog/preview/?code=...` に 302 でリダイレクトする。
2. `/blog/preview/`(静的ページ、`noindex`): ブラウザで `GET /api/blog/preview/?code=...` を呼び、下書きの記事と関連記事を表示する。
3. `GET /api/blog/preview/`(Worker): Cookie の署名・有効期限・`code` の一致を検証して返す(`Cache-Control: private, no-store`)。無効なら 401。

- プレビューキーは、ブラウザの JavaScript にも Cookie にも渡さない(Cookie の署名の HMAC の鍵に使う)。Cookie は `code` ごとに発行され、別の記事には使えない。
- 401(Cookie が無い・期限切れ・署名が不正・別の記事)は「有効期限が切れました」、404 は「記事が見つかりません」と画面に表示する。
- 存在しない記事は、a-blog cms が 404 を返すため、Worker も 404 を返す。
- Cookie 名は `__Secure-preview`(`__Secure-` は HTTPS で `Secure` が必須。Safari は `http://localhost` で `Secure` の Cookie を保存しないため、`wrangler dev` では Chrome か Firefox を使う)。
- `/blog/preview/*` は、`_headers` で `Referrer-Policy: no-referrer` と `X-Robots-Tag: noindex, nofollow` を付ける。`/api/*` は Worker が先に動くため `_headers` が効かず、Worker が同じ種類のヘッダーを付ける。

### プレビューキーの扱い

- a-blog cms のプレビューリンクの URL には、`previewKey` が含まれる。**URL は Workers Logs(`observability`)にクエリ付きで残る**ため、ログの閲覧権限は、プレビューキーを扱える人に限る。
- キーが漏れた(ログやブラウザの履歴から)可能性があるときは、a-blog cms 側でプレビューキーを再発行し、Worker の Secret(`ACMS_API_PREVIEW_KEY`)を更新する。Secret を変えると、発行済みの Cookie は、署名が合わなくなって、すべて無効になる。
- Worker のログには、エラーメッセージだけを出し、プレビューキーは `***` に伏せる。

## 記事の更新を反映する

静的書き出しは、記事を更新しても自動では反映されない。再ビルド・再デプロイが必要で、きっかけは次のとおり。

| きっかけ                       | 内容                                                                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **a-blog cms の更新(Webhook)** | **Cloudflare の Deploy Hook**(URL に POST するだけ。ヘッダー不要)。下記                                                                            |
| 手動                           | GitHub の Actions → `Deploy to Cloudflare` → Run workflow(Deploy Hook を呼ぶ)、または Cloudflare の Workers Builds の「Retry build」               |
| 定期実行                       | `Deploy to Cloudflare` の `schedule`(6 時間ごと、UTC)が、Deploy Hook を呼ぶ。通知漏れと、Zenn の記事一覧の更新を反映する。間隔は `cron` を変更する |
| `master` への push             | Workers Builds を Git に接続している場合、自動でビルド・デプロイされる                                                                             |

### a-blog cms の Webhook(スタンダードライセンスでも使える方法)

a-blog cms のスタンダードライセンスでは、Webhook に、ヘッダー(`Authorization` など)を指定できない。そのため、GitHub の API(`Authorization` ヘッダーが必須)は、a-blog cms から直接は呼べない。代わりに、**Cloudflare Workers Builds の Deploy Hook** を使う([公式](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks))。

1. Cloudflare ダッシュボード → Workers & Pages → `my-blog-site-frontend` → Settings → **Builds** で、GitHub のリポジトリに接続する(Workers Builds)。
   - Git のブランチ: `master`
   - **Build command**: `npm run build`(静的書き出し)
   - **Deploy command**: `npx wrangler deploy`(既定)
   - **Build variables and secrets**(ビルド時だけ有効。実行時の変数とは別): `NEXT_PUBLIC_BASE_URL`、`ACMS_API_PROTOCOL`、`ACMS_API_HOSTNAME`、`ACMS_API_PORT`、`ACMS_API_KEY`(Secret)、`ACMS_API_PREVIEW_KEY`(Secret)、`ACMS_ASSETS_PROTOCOL`、`ACMS_ASSETS_HOSTNAME`、`ACMS_ASSETS_PORT`
   - Node.js は 24 を使う(`NODE_VERSION=24` のビルド変数。公式の設定ページに Node の選び方の記載がないため、最初のビルドのログで、Node のバージョンを確認する)。
   - **実行時の変数**(Worker が `process.env` から読む)は、別に、Settings → Variables & Secrets に登録する(`keep_vars: true` のため、デプロイしても消えない)。
2. Settings → Builds → **Deploy Hooks** → 名前(例: `a-blog cms`)とブランチ(`master`)を指定して作成し、**URL をコピーする**。
3. a-blog cms の Webhook の URL を、この URL に変更する(今、Vercel の Deploy Hook の URL が設定されているなら、置き換える)。メソッドは **POST**。

- ヘッダーは不要で、URL の ID が認証になる。**URL は、秘密として扱う**(リポジトリに置かない)。漏れたときは、Deploy Hook を削除して、作り直す(古い URL は、削除と同時に無効になる)。
- 公式ドキュメントに記載があるのは **POST だけ**。a-blog cms の Webhook が、GET でしか送れない場合は、使えないため、確認する。
- 重複の防止: 同じ Deploy Hook が、前のビルドの開始前に、何度も呼ばれても、新しいビルドは作られない(`already_exists: true`)。
- 制限: Deploy Hook は、Worker あたり 1 分に 10 ビルドまで。Workers Builds は、無料プランで、月 3,000 ビルド分(同時に 1 ビルド、タイムアウト 20 分)。
- **`Deploy to Cloudflare`(GitHub Actions)は、この Deploy Hook を呼ぶだけ**(`curl -X POST`)。ビルドとデプロイは、Cloudflare(Workers Builds)で行われるため、Cloudflare の API トークンや、a-blog cms のキーを、GitHub に置く必要はない。
- GitHub の `production` Environment に、Secret `CLOUDFLARE_DEPLOY_HOOK_URL`(Deploy Hook の URL)を、1 つだけ登録する。**未設定の間は、定期実行と通知からの実行は、失敗の通知を出さずにスキップされ、手動実行は、はっきり失敗する。**
- Deploy Hook の URL は、GitHub の Secret にも、a-blog cms の設定にも、同じものを登録してよい。漏れたときは、Hook を削除して作り直し、両方を更新する。

### GitHub の repository_dispatch(ヘッダーを指定できる別のシステムから呼ぶ場合)

ヘッダーを指定できるシステムからは、GitHub の API でも `Deploy to Cloudflare` を動かせる(`event_type: acms-content-updated`)。

```bash
curl -fsS -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Authorization: Bearer <GitHub のトークン>" \
  https://api.github.com/repos/uidev1116/my-blog-site-frontend/dispatches \
  -d '{"event_type":"acms-content-updated"}'
```

- 成功すると、HTTP 204(本文なし)が返る。`-f` を付けているため、401 や 404 のときは、終了コードが 0 以外になる。
- トークンは、このリポジトリだけを対象にした fine-grained トークンで、`Contents: Read and write` が必要(`repository_dispatch` の権限)。**この権限は、`master` への push もできるほど強い**ため、漏れたときの影響が大きい。トークンは呼び出し側の設定にだけ置き、このリポジトリには置かない。漏れたら、すぐに失効させる。
- 連続して通知が来ても、`concurrency` で、デプロイは 1 つずつ実行される(実行中のデプロイは止めない)。

## Worker の Secret(1 回だけ登録する)

`ACMS_API_KEY` と `ACMS_API_PREVIEW_KEY` は、Worker の Secret として、1 回だけ登録する。デプロイしても消えない。値は、自分のターミナルで入力する(チャットや Git には載せない)。

```bash
printf '%s' "$ACMS_API_KEY" | npx wrangler secret put ACMS_API_KEY
printf '%s' "$ACMS_API_PREVIEW_KEY" | npx wrangler secret put ACMS_API_PREVIEW_KEY
```

実行時の変数(Secret 以外)は、Cloudflare の Settings → Variables & Secrets に登録する。`keep_vars: true` のため、デプロイしても消えない。ローカルから直接デプロイする方法は、次の節。

## ローカルから直接デプロイする(緊急用)

Workers Builds や Deploy Hook が使えないときは、自分のターミナルから、直接デプロイできる。キー(`ACMS_API_KEY`、`ACMS_API_PREVIEW_KEY`)は、そのシェルで `export` しておく(値は、チャットや Git に載せない)。

```bash
NEXT_PUBLIC_BASE_URL=https://blog.uidev.me ACMS_API_PROTOCOL=https ACMS_API_HOSTNAME=backend.uidev.jp ACMS_API_PORT= ACMS_ASSETS_PROTOCOL=https ACMS_ASSETS_HOSTNAME=assets.uidev.jp ACMS_ASSETS_PORT= npm run deploy -- --var NEXT_PUBLIC_BASE_URL:https://blog.uidev.me --var ACMS_API_PROTOCOL:https --var ACMS_API_HOSTNAME:backend.uidev.jp --var ACMS_ASSETS_PROTOCOL:https --var ACMS_ASSETS_HOSTNAME:assets.uidev.jp
```

`--var` は、Worker の実行時の変数(Secret 以外)を、更新するときに付ける。

## 本番切り替え

`docs/cloudflare-cutover.md` を参照。

## CI / CD(GitHub Actions)

| ワークフロー                                  | トリガー                                                                      | 内容                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                    | PR / master への push                                                         | 型チェック + Vitest、変更ファイルの ESLint / Prettier、静的書き出しのビルドと出力ファイルの確認            |
| `.github/workflows/deploy-cloudflare.yml`     | 手動 / `repository_dispatch`(`acms-content-updated`) / 6 時間ごと(`schedule`) | Cloudflare の Deploy Hook を呼んで、ビルド・デプロイを開始する(ビルド自体は、Cloudflare の Workers Builds) |
| `.github/workflows/dependabot-auto-merge.yml` | Dependabot の PR                                                              | major 以外の更新を、CI が全て成功したら自動でスカッシュマージ                                              |
| `.github/dependabot.yml`                      | 週次                                                                          | GitHub Actions と npm の更新 PR(`next`、typescript / eslint の major は対象外)                             |

- CI のビルドは `scripts/mock-acms.mjs` のモック API を使うため、シークレットは不要。
- ESLint / Prettier は、既存コードに未対応の指摘が残っているため、変更したファイルだけを検査する。
- `Deploy to Cloudflare` に必要な GitHub の設定は、`production` Environment の Secret `CLOUDFLARE_DEPLOY_HOOK_URL` だけ。Required reviewers は付けない(定期実行と通知が、承認待ちで止まるため)。デプロイ可能なブランチを `master` に限定する。
- `master` のブランチ保護の必須チェック名は、`Typecheck & Test`、`Lint (changed files)`、`Build (static export / Cloudflare)`。ジョブ名を変えたときは、ここも更新する。
