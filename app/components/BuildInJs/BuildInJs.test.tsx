// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ applyBuildIn: vi.fn() }));
vi.mock('@/app/lib/buildIn', () => m);
vi.mock('next/navigation', () => ({
  usePathname: () => '/a',
  useSearchParams: () => new URLSearchParams(),
}));

import BuildInJs from './BuildInJs';

it('何も描画せず、ページ表示時に document へ各ビルトイン JS を適用する', () => {
  const { container } = render(<BuildInJs />);

  expect(container).toBeEmptyDOMElement();
  expect(m.applyBuildIn).toHaveBeenCalledWith(document);
});
