import crossFetch from 'cross-fetch';

function getFetch() {
  if (typeof fetch === 'undefined') {
    return crossFetch;
  }
  return fetch;
}

export default function createFetch(
  apiKey: string,
): (
  req: RequestInfo | URL,
  init?: RequestInit,
) => Promise<{ request: Request; response: Response }> {
  const fetch = getFetch();

  return async (req, init) => {
    const headers = new Headers(init?.headers);

    if (!headers.has('X-API-KEY')) {
      headers.set('X-API-KEY', apiKey);
    }

    const request = new Request(req, { ...init, headers });

    const response = await fetch(request);
    return {
      request,
      response,
    };
  };
}
