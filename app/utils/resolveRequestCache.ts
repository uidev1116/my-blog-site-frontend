/**
 * 開発時はキャッシュを無効化する
 */
export default function resolveRequestCache(cache?: RequestInit['cache']) {
  if (process.env.NODE_ENV !== 'production') {
    return 'no-cache';
  }

  return cache;
}
