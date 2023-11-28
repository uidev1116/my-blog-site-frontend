/**
 * 開発時はキャッシュを無効化する
 */
export default function resolveRequestCache(cache?: RequestInit['cache']) {
  if (process.env.NODE_ENV === 'development') {
    return 'no-cache';
  }

  return cache;
}
