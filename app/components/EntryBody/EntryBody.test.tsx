// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.stubEnv('ACMS_ASSETS_PROTOCOL', 'https');
vi.stubEnv('ACMS_ASSETS_HOSTNAME', 'assets.example.com');
vi.stubEnv('ACMS_ASSETS_PORT', ''); // CI など、実行環境の値に依存させない

// next/image と next/link は、描画結果を単純にするため差し替える
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img data-next-image="true" src={src} alt={alt} />
  ),
}));
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

let EntryBody: typeof import('./EntryBody').default;

beforeAll(async () => {
  EntryBody = (await import('./EntryBody')).default;
});

describe('EntryBody', () => {
  it('見出しと段落をそのまま描画する', () => {
    render(<EntryBody html="<h2>見出し</h2><p>本文です</p>" />);

    expect(screen.getByRole('heading', { name: '見出し' })).toBeTruthy();
    expect(screen.getByText('本文です')).toBeTruthy();
  });

  it('リンクを描画し、href と中のテキストを保つ', () => {
    render(<EntryBody html='<p><a href="/blog/a.html">記事A</a></p>' />);

    const link = screen.getByRole('link', { name: '記事A' });
    expect(link.getAttribute('href')).toBe('/blog/a.html');
  });

  it('設定したアセットホストの画像は next/image で描画する', () => {
    render(
      <EntryBody html='<p><img src="https://assets.example.com/media/a.png" width="100" height="50" alt="図A"></p>' />,
    );

    const img = screen.getByAltText('図A');
    expect(img.getAttribute('data-next-image')).toBe('true');
    expect(img.getAttribute('src')).toBe(
      'https://assets.example.com/media/a.png',
    );
  });

  it('外部ホストの画像は next/image を使わずそのまま描画する', () => {
    render(
      <EntryBody html='<p><img src="https://other.example.org/b.png" alt="図B"></p>' />,
    );

    const img = screen.getByAltText('図B');
    expect(img.getAttribute('data-next-image')).toBeNull();
    expect(img.getAttribute('src')).toBe('https://other.example.org/b.png');
  });

  it('テーブルを描画する', () => {
    render(
      <EntryBody html="<table><tbody><tr><td>セル</td></tr></tbody></table>" />,
    );

    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByText('セル')).toBeTruthy();
  });
});
