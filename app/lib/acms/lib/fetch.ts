import crossFetch from 'cross-fetch';

export default function createFetch(): typeof fetch {
  if (typeof fetch === 'undefined') {
    return crossFetch;
  }
  return fetch;
}
