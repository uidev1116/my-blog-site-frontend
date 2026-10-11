# 本番切り替え(blog.uidev.me を Vercel から Cloudflare へ)

`blog.uidev.me` を Vercel から Cloudflare の Worker(静的アセット + `/api/*`)に切り替える手順。**この手順は、実行済み(`blog.uidev.me` は Cloudflare で配信中)。ロールバックや、同じ構成を作り直すときの記録として残す。** `blog.uidev.jp` の転送と、その転送先の `blog.uidev.me` は、Vercel のプロジェクトに残している(Vercel の転送先は、プロジェクトに登録したドメインからしか選べないため)。

## 現状(2026-10 時点で確認した内容)

- `uidev.me` の DNS は、すでに Cloudflare(`violet.ns.cloudflare.com` / `rory.ns.cloudflare.com`)にある。
- `blog.uidev.me` は、Vercel への CNAME(`ca31698bd1db4428.vercel-dns-017.com`、TTL は約 300 秒、Proxied ではなく DNS only)。**戻すときのために、この値を控えておく**。
- Cloudflare の Worker の「カスタムドメイン」は、そのホスト名に既存の DNS レコードがあると追加できない(先に削除する)。

## 重要な前提(旧ドメインの転送)

- `blog.uidev.jp` → `blog.uidev.me` の 308 リダイレクトは、**Vercel のプロジェクトの設定(Domains)が担っている**。旧ドメインの DNS は、Cloudflare ではなく、別の場所(会社の Xserver)にあり、Cloudflare に移せない。
- そのため、**Vercel のプロジェクトは、削除しない。** リダイレクト専用で残す(無料の Hobby プランで続けられる)。
- Vercel のプロジェクトから外すのは、`blog.uidev.me` のドメインだけ。`blog.uidev.jp`(リダイレクト設定)は、残す。
- Git 連携は外してよい(外しても、ドメインのリダイレクトは、Vercel の Domains の設定のため、動き続ける。**切り替え後に、`https://blog.uidev.jp/` が `https://blog.uidev.me/` に 308 で転送されることを確認する**)。

## 重要な順序

1. **先に、Vercel の自動デプロイを止める。** 静的書き出しを `master` にマージすると、Vercel の本番も静的書き出しで再ビルドされ、**検索とプレビューの API が無くなる**(Vercel には Worker が無い)。マージの前に、Vercel の Git 連携を外す(または Ignored Build Step で、ビルドをスキップする)。最後に成功した本番のデプロイは、そのまま残る。
2. `schedule`・`repository_dispatch` のワークフローは、`master`(既定ブランチ)にあるものだけが動く。`Deploy to Cloudflare` は、Cloudflare の Deploy Hook を呼ぶだけで、ビルドは Cloudflare(Workers Builds)が `master` から行う。

## 事前確認(切り替える前に)

1. **Cloudflare の Workers Builds**(`docs/cloudflare-workers.md` の「a-blog cms の Webhook」)
   - Worker を GitHub に接続し、ビルドコマンド(`npm run build`)、ビルド用の変数・Secret、`NODE_VERSION=24` を設定する。
   - Deploy Hook を作る(a-blog cms の Webhook 用)。
2. **GitHub の設定**(定期実行を、Deploy Hook で動かす場合)
   - `production` Environment の Secret `CLOUDFLARE_DEPLOY_HOOK_URL` に、Deploy Hook の URL を登録する(Cloudflare の API トークンや、a-blog cms のキーは、GitHub に不要)。
   - `production` Environment は、Required reviewers を付けず、デプロイ可能なブランチを `master` に限定する(定期実行と通知が、承認待ちで止まらないように)。
3. **Worker の Secret** を、1 回だけ `npx wrangler secret put <名前>` で登録する(`ACMS_API_KEY`、`ACMS_API_PREVIEW_KEY`)。
4. **`master` のブランチ保護**(必須チェック)
   - `Build (OpenNext / Cloudflare)` を、`Build (static export / Cloudflare)` に更新する(ジョブ名が変わった)。
   - Vercel の Git 連携を外すと、必須チェックの `Vercel` が報告されなくなり、PR がマージできなくなる。**`Vercel` を必須から外す**。
5. Vercel の自動デプロイを止める(上の「重要な順序」の 1)。
6. 静的書き出しの PR を `master` にマージし、Cloudflare の Workers Builds の「Retry build」(または GitHub Actions の `Deploy to Cloudflare` の手動実行)で、ビルドとデプロイが成功することを確認する。
7. `workers.dev` で、次が動くことを、実データで確認する。
   - トップ、記事、タグ、Zenn、プロフィール、`/feed.xml`、`/sitemap.xml`、`/robots.txt`
   - 検索(`/blog/search/?keyword=...`)と、ヘッダーの検索補完
   - リダイレクト(`/blog/entry-106.html`、`/feed`、`/blog/search/page/2/`)と 404
   - OGP 画像(`/blog/<記事>/opengraph-image`)の `Content-Type: image/png`
   - プレビュー(a-blog cms のプレビューリンク → `/blog/preview/`)
8. **a-blog cms の Webhook を、Vercel の Deploy Hook から、Cloudflare の Deploy Hook に切り替える。** a-blog cms のスタンダードライセンスでは、Webhook にヘッダーを指定できないため、URL に POST するだけの Cloudflare の Deploy Hook を使う(`docs/cloudflare-workers.md` の「記事の更新を反映する」)。
   - 切り替える時期: **切り替え(DNS)の後**。それまでは、Vercel の Deploy Hook のままにする(本番はまだ Vercel のため)。ただし、Vercel の Git 連携を外す(事前確認 5)と、Vercel の Deploy Hook は、使えなくなる可能性がある。Webhook を、切り替えの直前に、Cloudflare の Deploy Hook に変える。
   - 変更後、a-blog cms で記事を保存して、Cloudflare の Workers Builds のビルド履歴(Triggered by に Deploy Hook の名前)に、ビルドが現れることを確認する。

## ダウンタイムを避けて、本番ドメインでも検証する

`workers.dev` では、Cache API が使えない(ゾーン上のドメインでだけ動く)。**`worker/index.ts` の `cache.match` / `put` は、カスタムドメインで初めて通る**。切り替えの前に、別のホスト名で検証する。

1. Cloudflare ダッシュボードで、Worker にカスタムドメイン `blog-new.uidev.me` を追加する(新しいホスト名なので、既存のレコードと衝突しない)。
2. `https://blog-new.uidev.me/` で、事前確認 6 を行う。あわせて、`/api/blog/?keyword=...` を 2 回呼んで、2 回目が速いこと(エッジのキャッシュ)を確認する。
3. 問題がなければ、`blog-new.uidev.me` を外す(切り替え後は不要)。

## 切り替え

方法は 2 つある。**A のほうが、DNS の空白が無く、ロールバックも簡単。**

### A. Route 方式(おすすめ、ダウンタイムなし)

CNAME を削除せずに、プロキシ(オレンジの雲)を通して、Worker の Route を先に動かす。

1. Cloudflare ダッシュボード → Workers & Pages → `my-blog-site-frontend` → Settings → Domains & Routes → Add → Route → `blog.uidev.me/*`(ゾーン: `uidev.me`)。
   - コードで管理する場合: `wrangler.jsonc` に、次を追加してデプロイする。
     ```jsonc
     "routes": [{ "pattern": "blog.uidev.me/*", "zone_name": "uidev.me" }]
     ```
2. `blog.uidev.me` の CNAME を、**Proxied**(オレンジの雲)に変更する。Worker の Route は、Vercel(オリジン)より先に応答する。
3. 数分待って、`https://blog.uidev.me/` と、事前確認 6 を確認する。

### B. カスタムドメイン方式(DNS を作り直す)

1. Cloudflare の DNS で、`blog.uidev.me` の CNAME を削除する(値を控えてから)。
2. Worker の Settings → Domains & Routes → Add → Custom domain → `blog.uidev.me`(DNS レコードと証明書が、自動で作られる)。
   - コードで管理する場合は、`"routes": [{ "pattern": "blog.uidev.me", "custom_domain": true }]`。
3. 削除から追加までの間は、DNS のレコードが無い。DNS の否定キャッシュ(最大 30 分。ゾーンの SOA の minimum)で、一部のユーザーが、一時的にアクセスできないことがある。

## 切り替え後

- カスタムドメイン(ゾーン上)では、Cache API が使えるため、`/api/blog/` の検索結果が、エッジでもキャッシュされる(`worker/index.ts`)。
- Vercel のプロジェクトは、**削除しない**(`blog.uidev.jp` のリダイレクトを担っているため)。問題がなければ、Vercel のプロジェクトから `blog.uidev.me` のドメインだけを外す。
- Vercel の Git 連携は、外したままにする(`master` の静的書き出しを、Vercel がビルドしないように)。

## ロールバック

問題が起きたら、次の順で、Vercel に戻す。

**A(Route 方式)の場合**

1. Worker の Route(`blog.uidev.me/*`)を削除する(`wrangler.jsonc` に `routes` を追加した場合は、削除してデプロイする)。
2. `blog.uidev.me` の CNAME を、元のとおり **DNS only**(灰色の雲)に戻す(値は `ca31698bd1db4428.vercel-dns-017.com`)。

**B(カスタムドメイン方式)の場合**

1. Worker から、`blog.uidev.me` のカスタムドメインを削除する。自動で作られた DNS レコードが残っていたら、手で削除する。
2. Cloudflare の DNS に、`blog.uidev.me` の CNAME(`ca31698bd1db4428.vercel-dns-017.com`)を、**DNS only** で作る。新規のレコードは、既定で Proxied になるため、注意する。

**共通**

3. Vercel の Git 連携を外していた場合は、再接続する(最後に成功した本番のデプロイは、そのまま残っている)。ただし、`master` は静的書き出しなので、再ビルドすると、検索とプレビューが動かない。**ロールバック中は、`master` の変更を、Vercel に自動デプロイさせない**。
4. 必須チェックから外した `Vercel` は、Vercel を使い続けるなら、戻す。

戻すのに必要な時間は、数分(DNS の反映は、TTL の約 300 秒)。
