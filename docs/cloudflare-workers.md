# Cloudflare へのデプロイ(静的書き出し + 静的アセット)

Next.js を **静的書き出し(`output: 'export'`)** でビルドし、`out/` を Cloudflare の **静的アセット**として配信する。HTML は Worker を通らず、静的ファイルとして直接返る(配信は無料・無制限、CPU 制限も関係しない)。

動的な処理(検索 API、プレビュー)だけを、小さな Worker として `worker/` に置く。`wrangler.jsonc` の `assets.run_worker_first: ["/api/*"]` で、`/api/*` だけが Worker に届き、それ以外は静的ファイルが直接返る(Worker は動かない)。

> OpenNext(`@opennextjs/cloudflare`)は使わない。OpenNext では、静的ページも Worker 経由で配信され、1 リクエストあたり 30〜80 ミリ秒の CPU を使うため、無料プランの上限(10 ミリ秒)を超えた(`wrangler tail` で計測)。

## 構成

| ファイル                | 役割                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.js`        | `output: 'export'`、`trailingSlash`、`images.unoptimized`                                                                                                                                                                                                                                                                     |
| `worker/index.ts`       | Worker。`GET /api/blog/?keyword=...&page=N`(検索・一覧。`keyword` と `page` だけを a-blog cms に渡す)。`app/blog/api` を再利用する。範囲外のページは 0 件で返す。成功は `max-age=60`、エラーは `no-store`。カスタムドメインのゾーン上では、Cache API でエッジにもキャッシュする(workers.dev では使えず、キャッシュなしで動く) |
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
| 検索(SSR)、`/api/blog`、プレビュー(`draftMode`) | Worker に移す(PR2〜4)。PR1 の時点では動かない                                                      |

## 記事の更新を反映する

静的書き出しは、記事を更新しても自動では反映されない。`Deploy to Cloudflare`(`.github/workflows/deploy-cloudflare.yml`)を、次のタイミングで動かして、再ビルド・再デプロイする。

| きっかけ          | 内容                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| 手動              | GitHub の Actions → `Deploy to Cloudflare` → Run workflow                              |
| a-blog cms の更新 | `repository_dispatch`(`event_type: acms-content-updated`)を GitHub API に送る(下記)    |
| 定期実行          | 6 時間ごと(UTC)。通知漏れと、Zenn の記事一覧の更新を反映する。間隔は `cron` を変更する |

a-blog cms の更新通知(Webhook など)から呼ぶ API:

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <GitHub のトークン>" \
  https://api.github.com/repos/uidev1116/my-blog-site-frontend/dispatches \
  -d '{"event_type":"acms-content-updated"}'
```

- トークンは、このリポジトリだけを対象にした fine-grained トークンで、`Contents: Read and write` が必要(`repository_dispatch` の権限)。**トークンは a-blog cms 側の設定にだけ置き、このリポジトリには置かない**。
- 連続して通知が来ても、`concurrency` で、デプロイは 1 つずつ実行される(実行中のデプロイは止めない)。

## Worker の Secret(1 回だけ登録する)

`ACMS_API_KEY` と `ACMS_API_PREVIEW_KEY` は、Worker の Secret として、1 回だけ登録する。デプロイしても消えない。値は、自分のターミナルで入力する(チャットや Git には載せない)。

```bash
printf '%s' "$ACMS_API_KEY" | npx wrangler secret put ACMS_API_KEY
printf '%s' "$ACMS_API_PREVIEW_KEY" | npx wrangler secret put ACMS_API_PREVIEW_KEY
```

Secret 以外の実行時の変数は、デプロイのたびに、ワークフローが `--var` で渡す。

## 本番切り替え

`docs/cloudflare-cutover.md` を参照。

## CI / CD(GitHub Actions)

| ワークフロー                                  | トリガー                                             | 内容                                                                                            |
| --------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                    | PR / master への push                                | 型チェック + Vitest、変更ファイルの ESLint / Prettier、静的書き出しのビルドと出力ファイルの確認 |
| `.github/workflows/deploy-cloudflare.yml`     | 手動 / `repository_dispatch`(`acms-content-updated`) | テスト後に `npm run deploy` で Cloudflare にデプロイ                                            |
| `.github/workflows/dependabot-auto-merge.yml` | Dependabot の PR                                     | major 以外の更新を、CI が全て成功したら自動でスカッシュマージ                                   |
| `.github/dependabot.yml`                      | 週次                                                 | GitHub Actions と npm の更新 PR(`next`、typescript / eslint の major は対象外)                  |

- CI のビルドは `scripts/mock-acms.mjs` のモック API を使うため、シークレットは不要。
- ESLint / Prettier は、既存コードに未対応の指摘が残っているため、変更したファイルだけを検査する。
- デプロイに必要な設定(GitHub の `production` Environment):
  - Secrets: `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`ACMS_API_KEY`、`ACMS_API_PREVIEW_KEY`
  - Variables: `NEXT_PUBLIC_BASE_URL`、`ACMS_API_PROTOCOL`、`ACMS_API_HOSTNAME`、`ACMS_API_PORT`、`ACMS_ASSETS_PROTOCOL`、`ACMS_ASSETS_HOSTNAME`、`ACMS_ASSETS_PORT`
- `master` のブランチ保護の必須チェック名は、`Typecheck & Test`、`Lint (changed files)`、`Build (static export / Cloudflare)`、`Vercel`。ジョブ名を変えたときは、ここも更新する。
