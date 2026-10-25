import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getRootBlog: vi.fn(),
  getGlobalNavigation: vi.fn(),
  getFooterNavigation: vi.fn(),
}));
vi.mock('./api', () => m);
vi.mock('./globals.css', () => ({}));
vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <meta name="ga" content={gaId} />
  ),
}));
vi.mock('./stores/color-theme', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('./components', () => ({
  BuildInJs: () => <i data-c="buildin" />,
  Header: ({ navigations }: { navigations: unknown[] }) => (
    <header data-navs={navigations.length} />
  ),
  Footer: ({ navigations }: { navigations: unknown[] }) => (
    <footer data-navs={navigations.length} />
  ),
  CustomHtml: ({ html }: { html: string }) => <i data-custom={html} />,
  NextNProgress: ({ color }: { color: string }) => (
    <i data-c="progress" data-color={color} />
  ),
}));

import RootLayout from './layout';

const render = async () =>
  renderToStaticMarkup(await RootLayout({ children: <main>本文</main> }));

const rootBlog = (overrides = {}) => ({
  gaId: 'G-1',
  scriptHead: 'HEAD',
  scriptBodyStart: 'START',
  scriptBodyEnd: 'END',
  ...overrides,
});

beforeEach(() => {
  m.getRootBlog.mockResolvedValue(rootBlog());
  m.getGlobalNavigation.mockResolvedValue([{}, {}]);
  m.getFooterNavigation.mockResolvedValue([{}]);
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('RootLayout', () => {
  it('ja の html に Header / 本文 / Footer / 進捗バーを並べ、ナビゲーションを渡す', async () => {
    const html = await render();
    expect(html).toContain('lang="ja"');
    expect(html).toContain('data-c="buildin"');
    expect(html).toContain('<header data-navs="2"');
    expect(html).toContain('<main>本文</main>');
    expect(html).toContain('<footer data-navs="1"');
    expect(html).toContain('data-color="#fde047"');
  });

  describe('カスタムフィールドの script', () => {
    it('本番では、head の中・body の直後・body の末尾に出す', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const html = await render();
      const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
      expect(head).toContain('data-custom="HEAD"');
      expect(html).toMatch(/<body[^>]*><i data-custom="START"/);
      expect(html).toMatch(/data-custom="END"><\/i><\/body>/);
    });

    it('本番以外では出さない(開発中に計測タグなどを動かさない)', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(await render()).not.toContain('data-custom');
    });
  });

  it('本番で gaId があれば Google Analytics を出す', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(await render()).toContain('content="G-1"');
  });

  it('本番でも gaId が空なら出さない', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    m.getRootBlog.mockResolvedValue(rootBlog({ gaId: '' }));
    expect(await render()).not.toContain('name="ga"');
  });

  it('本番以外では出さない', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(await render()).not.toContain('name="ga"');
  });

  describe('Google AdSense', () => {
    const adsenseSrc =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1916494680308477';

    it('本番では、<head> に AdSense のスクリプトを出す(サイトの所有確認と広告の配信に必要)', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const html = await render();
      const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
      expect(head).toContain(`src="${adsenseSrc}"`);
      expect(head).toContain('async');
      expect(head).toContain('crossorigin="anonymous"');
    });

    it('本番以外では出さない(開発中の表示に広告のリクエストを送らない)', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(await render()).not.toContain('adsbygoogle');
    });
  });
});
