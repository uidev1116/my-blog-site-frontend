import crossFetch, * as polyfill from 'cross-fetch';

export default function createFetch(): typeof fetch {
  if (typeof fetch === 'undefined') {
    return crossFetch;
  }
  return fetch;
}

export function createHeaders(init?: HeadersInit | undefined) {
  if (typeof Headers === 'undefined') {
    return new polyfill.Headers(init);
  }
  return new Headers(init);
}

export function createRequest(
  input: URL | RequestInfo,
  init?: RequestInit | undefined,
) {
  if (typeof Request === 'undefined') {
    return new polyfill.Request(input, init);
  }
  return new Request(input, init);
}
