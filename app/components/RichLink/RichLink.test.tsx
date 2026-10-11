// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, it } from 'vitest';
import RichLink from './RichLink';

it('リンク先・タイトル・説明・サイト名・サムネイルを描画する', () => {
  const ref = createRef<HTMLAnchorElement>();
  render(
    <RichLink
      ref={ref}
      href="https://example.com/a"
      target="_blank"
      className="extra"
      title="タイトル"
      description="説明"
      siteName="サイト"
      imageSrc="https://example.com/a.png"
    />,
  );

  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', 'https://example.com/a');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveClass('extra');
  expect(ref.current).toBe(link);
  expect(screen.getByRole('heading', { name: 'タイトル' })).toBeInTheDocument();
  expect(screen.getByText('説明')).toBeInTheDocument();
  expect(screen.getByText('サイト')).toBeInTheDocument();
  expect(screen.getByAltText('サイトのサムネイル画像')).toHaveAttribute(
    'src',
    'https://example.com/a.png',
  );
});
