import type { AnchorHTMLAttributes, ReactNode } from 'react';

/** `next/link` のテスト用差し替え。単純な a 要素として描画する */
export function LinkMock({
  href,
  children,
  ...rest
}: { href: string; children?: ReactNode } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
