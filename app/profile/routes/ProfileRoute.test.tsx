// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Entry } from '@/app/types';

vi.mock('next/link', async () => ({
  default: (await import('@/app/test-utils/next-link')).LinkMock,
}));
/* eslint-disable @next/next/no-img-element */
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

import ProfileRoute from './ProfileRoute';

const entry = (overrides: Partial<Entry> = {}) =>
  ({
    id: 1,
    title: 'プロフィール',
    body: '<p>自己紹介</p>',
    ...overrides,
  }) as Entry;

describe('ProfileRoute', () => {
  it('タイトルと本文を表示する', () => {
    render(<ProfileRoute entry={entry()} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'プロフィール' }),
    ).toBeInTheDocument();
    expect(screen.getByText('自己紹介')).toBeInTheDocument();
  });

  it('本文が空ならタイトルだけ表示する', () => {
    render(<ProfileRoute entry={entry({ body: '' })} />);
    expect(
      screen.getByRole('heading', { name: 'プロフィール' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('自己紹介')).toBeNull();
  });
});
