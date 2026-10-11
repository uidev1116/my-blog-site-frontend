# Cloudflare Workers へのデプロイ

[OpenNext Cloudflare アダプター](https://opennext.js.org/cloudflare)(`@opennextjs/cloudflare`)で Cloudflare Workers に載せる。Vercel からの移行用の構成。

## 構成

| ファイル              | 役割                                                                              |
| --------------------- | --------------------------------------------------------------------------------- |
| `wrangler.jsonc`      | Worker 設定。静的アセット(`ASSETS`)と画像最適化(`IMAGES`)のバインディング         |
| `open-next.config.ts` | OpenNext 設定。キャッシュ(R2 / D1)は未使用                                        |
| `next.config.js`      | `initOpenNextCloudflareForDev()` で `next dev` でもバインディングを利用可能にする |

## コマンド

| コマンド          | 内容                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| `npm run preview` | OpenNext でビルドし、ローカルの workerd で起動する(`.dev.vars` が必要) |
| `npm run deploy`  | OpenNext でビルドし、Cloudflare にデプロイする                         |
| `npm test`        | Vitest(Cloudflare 互換性のテスト)                                      |

CLI は `opennextjs-cloudflare`(OpenNext 公式)を使う。Cloudflare の新 CLI `cf`(2026/9 にオープンベータ公開)は JS の Workers ではデプロイ時に Wrangler へ委譲する設計で、OpenNext 側は Wrangler 4.x に依存しているため、現時点では Wrangler 4.x を使う。`cf` / `cloudflare.config.ts` の安定版が出て OpenNext が対応したら移行を検討する。

## 環境変数

名前のみ記載する(値はダッシュボードで設定する)。

| 変数                                                                 | ビルド時                                   | 実行時 | 種別       |
| -------------------------------------------------------------------- | ------------------------------------------ | ------ | ---------- |
| `NEXT_PUBLIC_BASE_URL` / `BASE_URL`                                  | 必須                                       | 必須   | 変数       |
| `ACMS_API_PROTOCOL` / `ACMS_API_HOSTNAME` / `ACMS_API_PORT`          | 必須                                       | 必須   | 変数       |
| `ACMS_API_KEY`                                                       | 必須                                       | 必須   | **Secret** |
| `ACMS_API_PREVIEW_KEY`                                               | 必須                                       | 必須   | **Secret** |
| `ACMS_ASSETS_PROTOCOL` / `ACMS_ASSETS_HOSTNAME` / `ACMS_ASSETS_PORT` | 必須(`next.config.js` の `remotePatterns`) | 必須   | 変数       |

`wrangler.jsonc` は `keep_vars: true` のため、デプロイしてもダッシュボードで設定した変数・Secret は消えない。

Workers Builds でビルドする場合は、ビルド環境(Build variables)にも同じ値を設定する。

## レンダリングと更新

記事・一覧・タグ・プロフィール等はビルド時に静的生成され、**再デプロイしないと更新されない**(Vercel 時代から `revalidate` 未指定で同じ挙動)。記事公開時に再ビルド・再デプロイする仕組み(Workers Builds の Deploy Hook、GitHub Actions 等)が必要。

- `/blog/zenn` の 1 時間 ISR は、増分キャッシュ(R2)を設定していないため動作しない。ビルド時点の内容が配信される。必要になったら [キャッシュ設定](https://opennext.js.org/cloudflare/caching) で R2 を追加する。
- 実行時に Worker が動くのは `/blog/search`、`/api/blog`、`/api/blog/draft`、`/feed`、OGP 画像。

## 無料プラン運用の注意

- 静的アセットの配信は無料・無制限。Worker が動く上記ルートのみ 1 日 10 万リクエストの対象。
- Free は 1 リクエストあたり CPU 10 ms の制限がある。OGP 画像(`ImageResponse`)や検索 SSR が超過する場合は `Error 1102` になる。発生したら Paid プラン($5/月)にするか、`/feed` を `force-static` にする等で対処する。
- Worker サイズは gzip で約 2.3 MiB(`wrangler deploy --dry-run`、モックデータでの計測)。Free の上限は 3 MiB のため余裕が小さい。依存を増やしたら再計測する。
- 画像最適化(Cloudflare Images)は Free で月 5,000 ユニーク変換まで。超過後は新規変換がエラーになる(キャッシュ済みは配信される)。

## Next.js のバージョン

`@opennextjs/cloudflare` の peer 要件は `next >=16.3.8`。`next` は動作確認済みの 16.3.8 に固定している。16.4.0 では `.next/server/preview-props.json` が OpenNext のマニフェスト埋め込みの対象外で、実行時に `Unexpected loadManifest(/.next/server/preview-props.json)` となり全ルートが 500 になった(@opennextjs/cloudflare 1.20.10 時点)。OpenNext 側の修正リリース後に上げること。

## 移行時のロールバック

DNS を切り替えるまで Vercel が本番のまま。切り替え後に問題があれば DNS を Vercel に戻す(TTL は事前に短縮しておく)。

## 動作確認済み(ローカル workerd + モック ACMS)

`/`、`/blog/`、記事、`/profile/`、検索、`/api/blog`、`/feed/`、`/sitemap.xml`、`/robots.txt`、`/blog/zenn/`、リダイレクト(`next.config.js`)、プレビュー(`/api/blog/draft`)、404、OGP 画像、`/_next/image/` が期待どおり応答。**実際の ACMS・Cloudflare 上での確認は未実施。**

## 補足

- `.dev.vars` は `NEXT_PUBLIC_BASE_URL` のみ記載(`BASE_URL` は未設定時のフォールバック)。
- カスタムドメインはダッシュボード(Workers & Pages → Settings → Domains)で設定する。
- `compatibility_date` は動作確認した 2025-09-01 のまま。更新する場合は `npm run preview` で再確認する。
- `package-lock.json` は npm 10 で再生成したため差分が大きい(`peer` フラグの追加など)。依存の実質変更は `@opennextjs/cloudflare`・`wrangler`・`vitest` の追加と `next` の固定。

## CI / CD(GitHub Actions)

| ワークフロー                              | トリガー                                             | 内容                                                                                                        |
| ----------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                | PR / master への push                                | 型チェック + Vitest、変更ファイルの ESLint / Prettier、OpenNext ビルドと Worker サイズ確認(gzip 3 MiB 未満) |
| `.github/workflows/deploy-cloudflare.yml` | 手動 / `repository_dispatch`(`acms-content-updated`) | テスト後に `npm run deploy` で Cloudflare にデプロイ                                                        |
| `.github/dependabot.yml`                  | 週次                                                 | GitHub Actions と npm の更新 PR(`next` は対象外)                                                            |

- CI のビルドは `scripts/mock-acms.mjs` のモック API を使うため、シークレットは不要です。
- ESLint / Prettier は既存コードに未対応の指摘が残っているため、変更したファイルだけを検査します。
- デプロイは、DNS 切り替えが済むまで push では走らせていません。
- デプロイに必要な設定(GitHub の `production` Environment):
  - Secrets: `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`ACMS_API_KEY`、`ACMS_API_PREVIEW_KEY`
  - Variables: `NEXT_PUBLIC_BASE_URL`、`ACMS_API_PROTOCOL`、`ACMS_API_HOSTNAME`、`ACMS_API_PORT`、`ACMS_ASSETS_PROTOCOL`、`ACMS_ASSETS_HOSTNAME`、`ACMS_ASSETS_PORT`
- a-blog cms の更新時に再デプロイするには、更新イベントから GitHub API(`POST /repos/{owner}/{repo}/dispatches`、`event_type: acms-content-updated`)を呼びます。
