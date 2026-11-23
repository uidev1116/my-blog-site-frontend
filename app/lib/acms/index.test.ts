import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadClient() {
  vi.resetModules();
  return (await import('./index')).default;
}

function stubFetch() {
  const fetchMock = vi.fn(async () => Response.json({ ok: true }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function sentHeaders(fetchMock: ReturnType<typeof stubFetch>) {
  const init = (fetchMock.mock.calls[0] as unknown[])[1] as RequestInit;
  return new Headers(init.headers);
}

describe('acmsClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('サービストークンが設定されていれば、Access のヘッダーを付ける(requestInit を渡しても消えない)', async () => {
    vi.stubEnv('CF_ACCESS_CLIENT_ID', 'id.access');
    vi.stubEnv('CF_ACCESS_CLIENT_SECRET', 'secret');
    const fetchMock = stubFetch();
    const client = await loadClient();

    await client.get(
      { api: 'summary_top_index' },
      { requestInit: { cache: 'no-store' } },
    );

    const headers = sentHeaders(fetchMock);
    expect(headers.get('CF-Access-Client-Id')).toBe('id.access');
    expect(headers.get('CF-Access-Client-Secret')).toBe('secret');
    expect(headers.get('X-API-KEY')).toBe('test-api-key');
  });

  it('サービストークンが未設定なら、Access のヘッダーを付けない', async () => {
    vi.stubEnv('CF_ACCESS_CLIENT_ID', '');
    vi.stubEnv('CF_ACCESS_CLIENT_SECRET', '');
    const fetchMock = stubFetch();
    const client = await loadClient();

    await client.get({ api: 'summary_top_index' });

    const headers = sentHeaders(fetchMock);
    expect(headers.has('CF-Access-Client-Id')).toBe(false);
    expect(headers.has('CF-Access-Client-Secret')).toBe(false);
    expect(headers.get('X-API-KEY')).toBe('test-api-key');
  });
});
