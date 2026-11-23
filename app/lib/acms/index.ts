import {
  API_HOST,
  API_KEY,
  CF_ACCESS_CLIENT_ID,
  CF_ACCESS_CLIENT_SECRET,
} from '@/app/config/acms';
import { createClient } from '@uidev1116/acms-js-sdk';

const acmsClient = createClient({
  baseUrl: API_HOST,
  apiKey: API_KEY,
});

// バックエンドを Cloudflare Access で保護している場合、サービストークンを付けないと、
// API へのリクエストが Access のログイン画面(302)で止まる。
// SDK は、リクエストごとの requestInit が、クライアントの既定値を置き換えるため、
// 既定のヘッダーでは足りない。get() を包んで、毎回ヘッダーを足す。
// どちらかが未設定なら、何も足さない(Access を使わない環境・ローカルの mock)。
if (CF_ACCESS_CLIENT_ID && CF_ACCESS_CLIENT_SECRET) {
  const clientId = CF_ACCESS_CLIENT_ID;
  const clientSecret = CF_ACCESS_CLIENT_SECRET;
  const get = acmsClient.get.bind(acmsClient) as typeof acmsClient.get;
  acmsClient.get = ((urlComposable, options = {}) => {
    const headers = new Headers(options.requestInit?.headers);
    headers.set('CF-Access-Client-Id', clientId);
    headers.set('CF-Access-Client-Secret', clientSecret);
    return get(urlComposable, {
      ...options,
      requestInit: { ...options.requestInit, headers },
    });
  }) as typeof acmsClient.get;
}

export default acmsClient;
