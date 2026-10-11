// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('next/link', async () => ({
  default: (await import('@/app/test-utils/next-link')).LinkMock,
}));

import NotFound from './not-found';

it('404 とトップページへの導線を表示する', () => {
  render(<NotFound />);
  expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'トップページに戻る' }),
  ).toHaveAttribute('href', '/');
});
