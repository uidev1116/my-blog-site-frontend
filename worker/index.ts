import { getBlogEntries } from '@/app/blog/api';

// 静的アセット(out/)で配信できない、実行時の処理だけを担当する Worker。
// wrangler.jsonc の assets.run_worker_first で、/api/* だけがここに届く。

const MAX_KEYWORD_LENGTH = 200;
const MAX_PAGE = 1_000_000;

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

function parsePage(value: string | null): number | undefined | null {
  if (value === null || value === '') {
    return undefined;
  }
  if (!/^[1-9][0-9]*$/.test(value)) {
    return null;
  }
  const page = Number(value);
  return page <= MAX_PAGE ? page : null;
}

// GET /api/blog/?keyword=...&page=N  記事の検索・一覧
async function handleBlogEntries(url: URL) {
  const keyword = url.searchParams.get('keyword') ?? '';
  const page = parsePage(url.searchParams.get('page'));

  if (keyword.length > MAX_KEYWORD_LENGTH) {
    return json({ error: 'keyword is too long' }, 400);
  }
  if (page === null) {
    return json({ error: 'page must be a positive integer' }, 400);
  }

  try {
    const { entries, pager } = await getBlogEntries({
      ...(page !== undefined ? { page } : {}),
      // a-blog cms には、許可したパラメーターだけを渡す
      searchParams: new URLSearchParams({ keyword }),
    });
    return json({ entries, pager }, 200, {
      'Cache-Control': 'public, max-age=60',
    });
  } catch (error) {
    console.error('failed to fetch entries', error);
    return json({ error: 'Bad Gateway' }, 502);
  }
}

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ error: 'Method Not Allowed' }, 405, {
      Allow: 'GET, HEAD',
    });
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '');

  if (pathname === '/api/blog') {
    return handleBlogEntries(url);
  }

  return json({ error: 'Not Found' }, 404);
}

const worker = {
  fetch: handleRequest,
};

export default worker;
