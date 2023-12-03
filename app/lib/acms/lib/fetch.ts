import crossFetch, * as polyfill from 'cross-fetch';

export default function createFetch(): typeof fetch {
  if (typeof fetch === 'undefined') {
    return crossFetch;
  }
  return fetch;
}

export function createHeaders(...args: ConstructorParameters<typeof Headers>) {
  if (typeof Headers === 'undefined') {
    return new polyfill.Headers(...args);
  }
  return new Headers(...args);
}

export function createRequest(...args: ConstructorParameters<typeof Request>) {
  if (typeof Request === 'undefined') {
    return new polyfill.Request(...args);
  }
  return new Request(...args);
}
