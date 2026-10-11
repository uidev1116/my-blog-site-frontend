# 本番切り替え(blog.uidev.me を Vercel から Cloudflare へ)

`blog.uidev.me` を Vercel から Cloudflare の Worker(静的アセット + `/api/*`)に切り替える手順。**この文書は手順であり、まだ実行していない。**

## 現状(2026-10 時点で確認した内容)

- `uidev.me` の DNS は、すでに Cloudflare(`violet.ns.cloudflare.com` / `rory.ns.cloudflare.com`)にある。
- `blog.uidev.me` は、Vercel への CNAME(`ca31698bd1db4428.vercel-dns-017.com`、TTL は約 300 秒)。**戻すときのために、この値を控えておく**。
- Cloudflare の Worker の「カスタムドメイン」は、そのホスト名に既存の DNS レコードがあると追加できない(先に削除する)。そのため、切り替えは、CNAME の削除から、カスタムドメインの追加までの、短い切り替えになる。

## 事前確認(切り替える前に)

1. `workers.dev` で、次が動くことを、実データで確認する。
   - トップ、記事、タグ、Zenn、プロフィール、`/feed.xml`、`/sitemap.xml`、`/robots.txt`
   - 検索(`/blog/search/?keyword=...`)と、ヘッダーの検索補完
   - リダイレクト(`/blog/entry-106.html`、`/feed`、`/blog/search/page/2/`)と 404
   - OGP 画像(`/blog/<記事>/opengraph-image`)の `Content-Type: image/png`
   - プレビュー(a-blog cms のプレビューリンク → `/blog/preview/`)
2. 環境変数を揃える(`docs/cloudflare-workers.md`)。
   - GitHub の `production` Environment に、Secrets(`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`ACMS_API_KEY`、`ACMS_API_PREVIEW_KEY`)と Variables。
   - Worker の Secret(`ACMS_API_KEY`、`ACMS_API_PREVIEW_KEY`)を、1 回だけ `npx wrangler secret put <名前>` で登録する(デプロイでは消えない)。
3. `NEXT_PUBLIC_BASE_URL` が、本番の URL(`https://blog.uidev.me`)になっている(canonical、OGP、sitemap、RSS の基準)。
4. GitHub Actions の `Deploy to Cloudflare` を手動で 1 回実行して、成功することを確認する。
5. a-blog cms の更新通知(`docs/cloudflare-workers.md` の「記事の更新を反映する」)を設定する。
6. `master` のブランチ保護の必須チェック名を、`Build (static export / Cloudflare)` に更新する(ジョブ名が変わったため)。

## 切り替え

1. **TTL を短くする**: Cloudflare の DNS で、`blog.uidev.me` の TTL が自動(約 300 秒)であることを確認する(すでに短い)。
2. **Vercel の CNAME を削除する**: Cloudflare ダッシュボード → DNS → `blog.uidev.me` の CNAME を削除する(値を控えてから)。
3. **カスタムドメインを追加する**: Cloudflare ダッシュボード → Workers & Pages → `my-blog-site-frontend` → Settings → Domains & Routes → Add → Custom domain → `blog.uidev.me`。
   - コードで管理する場合は、`wrangler.jsonc` に、次を追加してデプロイする。
     ```jsonc
     "routes": [{ "pattern": "blog.uidev.me", "custom_domain": true }]
     ```
4. 数分待って、`https://blog.uidev.me/` と、事前確認の項目を、もう一度確認する。
5. DNS の否定キャッシュ(最大 30 分)で、一部のユーザーが、一時的にアクセスできないことがある。

## 切り替え後

- カスタムドメイン(ゾーン上)では、Cache API が使えるため、`/api/blog/` の検索結果が、エッジでもキャッシュされる(`worker/index.ts`)。
- Vercel のプロジェクトは、しばらく残す(ロールバック用)。問題がなければ、Git の連携を外すか、プロジェクトを削除する。
- `master` に入れた時点で、Vercel は静的書き出しをビルドするが、検索・プレビューの API が無いため、Vercel 上では、それらが動かない。Vercel を残す間は、Vercel の自動デプロイを止める(Git の連携を外す)ことを推奨する。

## ロールバック

問題が起きたら、次の順で、Vercel に戻す。

1. Cloudflare ダッシュボードで、Worker の `blog.uidev.me` のカスタムドメインを削除する(`wrangler.jsonc` に `routes` を追加した場合は、削除してデプロイする)。
2. Cloudflare の DNS に、`blog.uidev.me` の CNAME(`ca31698bd1db4428.vercel-dns-017.com`)を戻す。
3. Vercel のプロジェクトは、Git の連携を外していた場合、再接続する(最後に成功したデプロイは、そのまま残っている)。

戻すのに必要な時間は、数分(DNS の反映は、TTL の約 300 秒)。
