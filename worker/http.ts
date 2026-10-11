// MIME の推測と、Referer の送信(下書きの code や previewKey を含む URL の漏えい)を止める
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

// 成功したレスポンスだけキャッシュを許可し、エラーはキャッシュさせない
export function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...headers,
    },
  });
}
