import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// 記事ページ等はビルド時に静的生成され、再デプロイで更新する運用のため、
// 増分キャッシュ(R2)やタグキャッシュ(D1)は使用しない。
// Zenn一覧の1時間ISRなど実行時の再検証が必要になった場合は、
// https://opennext.js.org/cloudflare/caching を参照してR2等を設定する。
export default defineCloudflareConfig();
