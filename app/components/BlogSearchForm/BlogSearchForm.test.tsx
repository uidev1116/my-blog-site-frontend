// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => '/blog/',
  useSearchParams: () => nav.searchParams,
}));
vi.mock('next/dynamic', async () => {
  const { dynamicMock } = await import('@/app/test-utils/next-dynamic');
  return { default: dynamicMock };
});

import BlogSearchForm from './BlogSearchForm';

const fetchMock = vi.fn();
const entries = [
  { id: 1, title: 'React 入門', path: '/blog/react.html' },
  { id: 2, title: 'Next.js 入門', path: '/blog/next.html' },
];

// SWR のキャッシュをテスト間で共有しない
const renderForm = () =>
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <BlogSearchForm id="form" />
    </SWRConfig>,
  );

const findInput = () => screen.findByRole('combobox');

beforeEach(() => {
  nav.push.mockReset();
  nav.searchParams = new URLSearchParams();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ entries }) });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BlogSearchForm', () => {
  it('検索フォームと入力欄を描画する', async () => {
    renderForm();
    expect(screen.getByRole('search')).toHaveAttribute('id', 'form');
    const input = await findInput();
    expect(input).toHaveAttribute('placeholder', '検索...');
    expect(input).toHaveAttribute('name', 'keyword');
  });

  it('入力するとキーワードで記事を検索し、候補を表示する', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(await findInput(), 'あ');

    expect(
      await screen.findByRole('option', { name: 'React 入門' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Next.js 入門' }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/blog/?keyword=${encodeURIComponent('あ')}`,
    );
  });

  it('候補を選ぶとその記事へ遷移する', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(await findInput(), 'r');
    await user.click(await screen.findByRole('option', { name: 'React 入門' }));

    expect(nav.push).toHaveBeenCalledWith('/blog/react.html');
  });

  it('候補を選ばずに Enter を押すと検索ページへ遷移する', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(await findInput(), 'a b{Enter}');

    await waitFor(() =>
      expect(nav.push).toHaveBeenCalledWith('/blog/search/?keyword=a%20b'),
    );
  });

  it('フォームを submit すると検索ページへ遷移する', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(await findInput(), 'test');
    screen
      .getByRole('search')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await waitFor(() =>
      expect(nav.push).toHaveBeenCalledWith('/blog/search/?keyword=test'),
    );
  });

  it('キーワードが空なら遷移しない', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(await findInput());
    await user.keyboard('{Enter}');
    expect(nav.push).not.toHaveBeenCalled();
  });

  it('検索に失敗するとエラーメッセージを表示する', async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const user = userEvent.setup();
    renderForm();
    await user.type(await findInput(), 'a');

    expect(
      await screen.findByText('記事の検索に失敗しました。'),
    ).toBeInTheDocument();
  });

  it('入力を空にすると候補をリセットする', async () => {
    const user = userEvent.setup();
    renderForm();
    const input = await findInput();
    await user.type(input, 'a');
    await screen.findByRole('option', { name: 'React 入門' });

    await user.clear(input);
    await waitFor(() => expect(screen.queryByRole('option')).toBeNull());
  });

  it('URL に keyword があれば入力欄に反映する', async () => {
    nav.searchParams = new URLSearchParams('keyword=hello');
    renderForm();
    await waitFor(async () => expect(await findInput()).toHaveValue('hello'));
  });
});
