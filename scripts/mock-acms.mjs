// CI / ローカル検証用のモック a-blog cms API。実データなしでビルドを通すためのもの。
// 使い方: node scripts/mock-acms.mjs  (127.0.0.1:8787。PORT で変更可)
import http from 'node:http';
const port = Number(process.env.PORT ?? 8787);
const base = `http://127.0.0.1:${port}`;
// OGP 画像の背景は、Next.js(ImageResponse)の SSRF 対策で 127.0.0.1 や localhost だと取得できない。
// 127.0.0.1 に名前解決される localtest.me を使う
const ogpOrigin = process.env.OGP_ORIGIN ?? `http://localtest.me:${port}`;
const now = '2026-01-01T00:00:00+09:00';
const mkEntry = (n) => ({
  eid: n,
  ecd: `post-${n}`,
  sort: n,
  csort: n,
  usort: n,
  status: 'open',
  title: `テスト記事 ${n}`,
  url: `${base}/blog/post-${n}/`,
  isNew: false,
  datetime: now,
  updatedAt: now,
  createdAt: now,
  publishStartAt: now,
  publishEndAt: now,
  summary: 'summary',
  tags: [{ name: 'tag a', url: `${base}/blog/tag/tag%20a/` }],
  blog: {
    bid: 2,
    code: 'blog',
    name: 'Blog',
    url: `${base}/blog/`,
    fields: {
      ogp_image_base: { value: { path: `${ogpOrigin}/media/ogp.png?x=1` } },
    },
  },
  body: '<h2>見出し</h2><p>本文 <img src="http://127.0.0.1:8787/media/a.png" width="100" height="50" alt="a"></p>',
});
const items = [1, 2, 3].map(mkEntry);
const nav = {
  'navigation:loop': [
    {
      label: 'Blog',
      level: '1',
      'link#front': { url: `${base}/blog/`, target: '' },
    },
  ],
};
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
http
  .createServer((req, res) => {
    const u = new URL(req.url, base);
    if (u.pathname.startsWith('/media/')) {
      res.setHeader('content-type', 'image/png');
      return res.end(png);
    }
    const body = {
      items,
      indexUrl: `${base}/blog/`,
      indexBlogName: 'Blog',
      pagination: {
        firstPage: 1,
        lastPage: 1,
        prevPage: null,
        nextPage: null,
        pages: [{ page: 1, url: `${base}/blog/` }],
      },
      'tag:loop': [{ name: 'tag a' }],
      'url:loop': [{ loc: `${base}/blog/post-1/`, lastmod: now }],
      'entry:loop': [],
      'item:loop': [],
      lastBuildDate: now,
      ...nav,
      id: 1,
      name: 'Blog',
      title: 'Blog',
      description: 'desc',
      ga_tracking_id: '',
      'selected:loop': [],
      'choice:loop': [],
    };
    console.log(req.method, u.pathname);
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(body));
  })
  .listen(port);
