// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.stubEnv('ACMS_ASSETS_PROTOCOL', 'https');
vi.stubEnv('ACMS_ASSETS_HOSTNAME', 'assets.example.com');
vi.stubEnv('ACMS_ASSETS_PORT', ''); // CI など、実行環境の値に依存させない

// next/image と next/link は、描画結果を単純にするため差し替える
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-next-image="true"
      data-fill={String(Boolean(fill))}
      src={src}
      alt={alt}
      title={rest.title as string | undefined}
    />
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

  it('width / height が空の画像は fill で描画する', () => {
    render(
      <EntryBody html='<p><img src="https://assets.example.com/media/a.png" width="" height="" alt="図F"></p>' />,
    );
    expect(screen.getByAltText('図F')).toHaveAttribute('data-fill', 'true');
  });

  it('width / height がある画像は fill にしない', () => {
    render(
      <EntryBody html='<p><img src="https://assets.example.com/media/a.png" width="10" height="10" alt="図N"></p>' />,
    );
    expect(screen.getByAltText('図N')).toHaveAttribute('data-fill', 'false');
  });

  it('アセットホストのサブドメインも next/image で描画する', () => {
    render(
      <EntryBody html='<p><img src="https://cdn.assets.example.com/a.png" width="1" height="1" alt="図S"></p>' />,
    );
    expect(screen.getByAltText('図S')).toHaveAttribute(
      'data-next-image',
      'true',
    );
  });

  it('相対パスや src が空の画像は next/image を使わない', () => {
    render(
      <EntryBody html='<p><img src="/media/a.png" alt="図R"><img src="" alt="図E"></p>' />,
    );
    expect(screen.getByAltText('図R')).not.toHaveAttribute('data-next-image');
    expect(screen.getByAltText('図E')).not.toHaveAttribute('data-next-image');
  });

  it('URL として解析できなくてもアセットホストで始まれば next/image で描画する', () => {
    render(
      <EntryBody html='<p><img src="https://assets.example.com:bad/a.png" width="1" height="1" alt="図P"></p>' />,
    );
    expect(screen.getByAltText('図P')).toHaveAttribute(
      'data-next-image',
      'true',
    );
  });

  it('解析できず別ホストの画像は next/image を使わない', () => {
    render(<EntryBody html='<p><img src="http://[bad" alt="図X"></p>' />);
    expect(screen.getByAltText('図X')).not.toHaveAttribute('data-next-image');
  });

  it('アセットホストの画像を含むリンクは、リンクではなく拡大表示ボタンになる', () => {
    render(
      <EntryBody html='<a href="/x"><img src="https://assets.example.com/media/a.png" width="10" height="10" alt="図L"></a>' />,
    );
    expect(
      screen.getByRole('button', { name: '画像を拡大表示する' }),
    ).toBeInTheDocument();
    expect(screen.getByAltText('図L')).toHaveAttribute(
      'data-next-image',
      'true',
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('アセットホストの画像を含むリンクで width / height が空なら fill', () => {
    render(
      <EntryBody html='<a href="/x"><img src="https://assets.example.com/media/a.png" width="" height="" alt="図M"></a>' />,
    );
    expect(screen.getByAltText('図M')).toHaveAttribute('data-fill', 'true');
  });

  it('外部画像を含むリンクは通常のリンクとして描画する', () => {
    render(
      <EntryBody html='<a href="/x"><img src="https://other.example.org/a.png" alt="図O"></a>' />,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/x');
    expect(screen.getByAltText('図O')).toBeInTheDocument();
  });

  it('tbody が無いテーブルには tbody を補う', () => {
    const { container } = render(
      <EntryBody html="<table><tr><td>セル</td></tr></table>" />,
    );
    expect(container.querySelector('table > tbody td')).toHaveTextContent(
      'セル',
    );
  });

  describe('column-embed', () => {
    const embed = `
      <div class="column-embed">
        <a href="https://example.org/post">
          <img src="https://example.org/thumb.png">
          <span class="quoteTitle">引用タイトル</span>
          <span class="quoteDescription">引用の説明</span>
          <span class="quoteSiteName">引用サイト</span>
        </a>
      </div>`;

    it('リッチリンクに置き換える', () => {
      render(<EntryBody html={embed} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.org/post');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(
        screen.getByRole('heading', { name: '引用タイトル' }),
      ).toBeInTheDocument();
      expect(screen.getByText('引用の説明')).toBeInTheDocument();
      expect(screen.getByText('引用サイト')).toBeInTheDocument();
      expect(screen.getByAltText('引用サイトのサムネイル画像')).toHaveAttribute(
        'src',
        'https://example.org/thumb.png',
      );
    });

    it('タイトル・説明・サイト名・画像が欠けていても描画できる', () => {
      render(
        <EntryBody html='<div class="column-embed"><a href="https://example.org/"></a></div>' />,
      );
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://example.org/',
      );
    });

    it('リンクを含まない column-embed はそのまま描画する', () => {
      render(
        <EntryBody html='<div class="column-embed"><p>リンク無し</p></div>' />,
      );
      expect(screen.getByText('リンク無し')).toBeInTheDocument();
      expect(screen.queryByRole('link')).toBeNull();
    });
  });
});
