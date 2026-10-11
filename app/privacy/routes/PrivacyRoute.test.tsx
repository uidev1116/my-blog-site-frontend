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

import PrivacyRoute from './PrivacyRoute';

const entry = (overrides: Partial<Entry> = {}) =>
  ({
    id: 1,
    title: 'プライバシーポリシー',
    body: '<p>個人情報の取り扱い</p>',
    ...overrides,
  }) as Entry;

describe('PrivacyRoute', () => {
  it('タイトルと本文を表示する', () => {
    render(<PrivacyRoute entry={entry()} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'プライバシーポリシー' }),
    ).toBeInTheDocument();
    expect(screen.getByText('個人情報の取り扱い')).toBeInTheDocument();
  });

  it('本文が空ならタイトルだけ表示する', () => {
    render(<PrivacyRoute entry={entry({ body: '' })} />);
    expect(
      screen.getByRole('heading', { name: 'プライバシーポリシー' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('個人情報の取り扱い')).toBeNull();
  });
});
