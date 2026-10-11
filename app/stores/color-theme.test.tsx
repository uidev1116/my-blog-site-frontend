// @vitest-environment jsdom
import { act, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ColorThemeContextProvider, {
  isDarkMode,
  useColorThemeStore,
} from './color-theme';

const mockMatchMedia = (matches: boolean) => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
  window.matchMedia = globalThis.matchMedia;
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <ColorThemeContextProvider>{children}</ColorThemeContextProvider>
);

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  mockMatchMedia(false);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isDarkMode', () => {
  it('dark なら true、light なら false', () => {
    expect(isDarkMode('dark')).toBe(true);
    expect(isDarkMode('light')).toBe(false);
  });

  it('未設定ならシステム設定に従う', () => {
    mockMatchMedia(true);
    expect(isDarkMode(undefined)).toBe(true);
    mockMatchMedia(false);
    expect(isDarkMode(undefined)).toBe(false);
  });
});

describe('ColorThemeContextProvider', () => {
  it('子要素を描画する', () => {
    render(<ColorThemeContextProvider>hello</ColorThemeContextProvider>);
    expect(screen.getByText('hello')).toBeTruthy();
  });

  it('既定 (未設定・ライトのシステム設定) では dark クラスを付けない', () => {
    renderHook(() => useColorThemeStore(), { wrapper });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('システム設定がダークなら dark クラスを付ける', () => {
    mockMatchMedia(true);
    renderHook(() => useColorThemeStore(), { wrapper });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('テーマを変更すると dark クラスが切り替わり localStorage に保存される', () => {
    const { result } = renderHook(() => useColorThemeStore(), { wrapper });

    act(() => result.current.changeColorTheme('dark'));
    expect(result.current.colorTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('color-theme')).toBe('"dark"');

    act(() => result.current.changeColorTheme('light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('removeColorTheme で保存値を消す', () => {
    localStorage.setItem('color-theme', '"dark"');
    const { result } = renderHook(() => useColorThemeStore(), { wrapper });
    expect(result.current.colorTheme).toBe('dark');

    act(() => result.current.removeColorTheme());
    expect(localStorage.getItem('color-theme')).toBeNull();
    expect(result.current.colorTheme).toBeUndefined();
  });
});

describe('useColorThemeStore (Provider 外)', () => {
  it('既定値を返し、操作しても例外にならない', () => {
    const { result } = renderHook(() => useColorThemeStore());
    expect(result.current.colorTheme).toBeUndefined();
    expect(() => {
      result.current.changeColorTheme('dark');
      result.current.removeColorTheme();
    }).not.toThrow();
  });
});
