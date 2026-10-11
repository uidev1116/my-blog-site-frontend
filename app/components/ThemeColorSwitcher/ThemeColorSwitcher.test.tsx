// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { initDropdowns, hide } = vi.hoisted(() => ({
  initDropdowns: vi.fn(),
  hide: vi.fn(),
}));
vi.mock('flowbite', () => ({ initDropdowns }));

import ColorThemeContextProvider from '@/app/stores/color-theme';
import ThemeColorSwitcher from './ThemeColorSwitcher';

const renderSwitcher = () =>
  render(
    <ColorThemeContextProvider>
      <ThemeColorSwitcher />
    </ColorThemeContextProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  hide.mockClear();
  initDropdowns.mockClear();
  vi.stubGlobal('FlowbiteInstances', { getInstance: vi.fn(() => ({ hide })) });
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
  window.matchMedia = globalThis.matchMedia;
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ThemeColorSwitcher', () => {
  it('ドロップダウンを初期化し、3 つのテーマ項目を表示する', () => {
    renderSwitcher();
    expect(initDropdowns).toHaveBeenCalled();
    for (const name of ['light', 'dark', 'system']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('未設定のときは system が選択状態', () => {
    renderSwitcher();
    expect(
      screen.getByRole('button', { name: 'system' }).closest('li'),
    ).toHaveClass('is-selected');
  });

  it('dark を選ぶとテーマを保存し、ドロップダウンを閉じる', () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole('button', { name: 'dark' }));

    expect(localStorage.getItem('color-theme')).toBe('"dark"');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(
      screen.getByRole('button', { name: 'dark' }).closest('li'),
    ).toHaveClass('is-selected');
    expect(hide).toHaveBeenCalled();
  });

  it('light を選ぶと light が選択される', () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole('button', { name: 'light' }));
    expect(localStorage.getItem('color-theme')).toBe('"light"');
  });

  it('system を選ぶと保存したテーマを消す', () => {
    localStorage.setItem('color-theme', '"dark"');
    renderSwitcher();
    fireEvent.click(screen.getByRole('button', { name: 'system' }));
    expect(localStorage.getItem('color-theme')).toBeNull();
    expect(hide).toHaveBeenCalled();
  });

  it('システム設定がダークでテーマ未設定なら、ダーク用のアイコンボタンを text-gray 系で描画する', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const { container } = renderSwitcher();
    const toggle = container.querySelector('[data-dropdown-toggle]')!;
    expect(toggle).toHaveClass('text-gray-800');
    expect(toggle).not.toHaveClass('text-primary');
  });

  it('テーマを明示すると text-primary になる', () => {
    localStorage.setItem('color-theme', '"light"');
    const { container } = renderSwitcher();
    expect(container.querySelector('[data-dropdown-toggle]')).toHaveClass(
      'text-primary',
    );
  });
});
