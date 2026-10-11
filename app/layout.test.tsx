import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getGaId: vi.fn(),
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
  NextNProgress: ({ color }: { color: string }) => (
    <i data-c="progress" data-color={color} />
  ),
}));

import RootLayout from './layout';

const render = async () =>
  renderToStaticMarkup(await RootLayout({ children: <main>本文</main> }));

beforeEach(() => {
  m.getGaId.mockResolvedValue('G-1');
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

  it('本番で gaId があれば Google Analytics を出す', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(await render()).toContain('content="G-1"');
  });

  it('本番でも gaId が空なら出さない', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    m.getGaId.mockResolvedValue('');
    expect(await render()).not.toContain('name="ga"');
  });

  it('本番以外では出さない', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(await render()).not.toContain('name="ga"');
  });
});
