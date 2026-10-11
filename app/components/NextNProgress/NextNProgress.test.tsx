// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const np = vi.hoisted(() => ({
  configure: vi.fn(),
  start: vi.fn(),
  done: vi.fn(),
}));
vi.mock('nprogress', () => ({ default: np }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/a',
  useSearchParams: () => new URLSearchParams(),
}));

import NextNProgress from './NextNProgress';

beforeEach(() => {
  np.configure.mockClear();
  np.start.mockClear();
  np.done.mockClear();
  document.body.innerHTML = '';
  window.history.replaceState({}, '', '/current');
});

const styleOf = (container: HTMLElement) =>
  container.querySelector('style')!.textContent!;

describe('NextNProgress スタイル', () => {
  it('既定の色・高さ・上部配置・影を使う', () => {
    const { container } = render(<NextNProgress />);
    const css = styleOf(container);
    expect(css).toContain('background:#29d');
    expect(css).toContain('height:3px');
    expect(css).toContain('top: 0;');
    expect(css).toContain('z-index:1600');
    expect(css).toContain('box-shadow:0 0 10px #29d,0 0 5px #29d');
  });

  it('色・高さ・zIndex・下部配置を指定できる', () => {
    const { container } = render(
      <NextNProgress color="#f00" height={5} zIndex={10} showAtBottom />,
    );
    const css = styleOf(container);
    expect(css).toContain('background:#f00');
    expect(css).toContain('height:5px');
    expect(css).toContain('z-index:10');
    expect(css).toContain('bottom: 0;');
    expect(css).toContain('bottom: 15px;');
  });

  it('shadow に文字列を渡すとそれを使い、false なら影を付けない', () => {
    expect(
      styleOf(render(<NextNProgress shadow="0 0 1px red" />).container),
    ).toContain('box-shadow:0 0 1px red');
    expect(
      styleOf(render(<NextNProgress shadow={false} />).container),
    ).not.toContain('box-shadow');
  });
});

describe('NextNProgress 設定', () => {
  it('既定値で NProgress を設定する', () => {
    render(<NextNProgress />);
    expect(np.configure).toHaveBeenCalledWith(
      expect.objectContaining({
        showSpinner: true,
        trickle: true,
        trickleSpeed: 200,
        minimum: 0.08,
        easing: 'ease',
        speed: 200,
      }),
    );
  });

  it('指定した値で NProgress を設定する', () => {
    render(
      <NextNProgress
        showSpinner={false}
        crawl={false}
        crawlSpeed={500}
        initialPosition={0.5}
        easing="linear"
        speed={100}
        template="<div/>"
      />,
    );
    expect(np.configure).toHaveBeenCalledWith({
      showSpinner: false,
      trickle: false,
      trickleSpeed: 500,
      minimum: 0.5,
      easing: 'linear',
      speed: 100,
      template: '<div/>',
    });
  });

  it('ページ遷移の検知で進捗を開始・完了する', () => {
    render(<NextNProgress />);
    expect(np.start).toHaveBeenCalled();
    expect(np.done).toHaveBeenCalled();
  });
});

describe('NextNProgress クリック処理', () => {
  const clickAnchor = (attrs: Record<string, string>, ctrlKey = false) => {
    const a = document.createElement('a');
    Object.entries(attrs).forEach(([k, v]) => a.setAttribute(k, v));
    const span = document.createElement('span');
    a.appendChild(span);
    document.body.appendChild(a);
    np.start.mockClear();
    np.done.mockClear();
    fireEvent.click(span, { ctrlKey });
  };

  it('現在と同じ URL へのリンクは進捗を即座に終わらせ nprogress-busy を外す', () => {
    document.documentElement.classList.add('nprogress-busy');
    render(<NextNProgress />);
    clickAnchor({ href: window.location.href });
    expect(np.start).toHaveBeenCalledTimes(1);
    expect(np.done).toHaveBeenCalledTimes(1);
    expect(document.documentElement.classList.contains('nprogress-busy')).toBe(
      false,
    );
  });

  it('Ctrl 押下のクリックでも進捗を終わらせる', () => {
    render(<NextNProgress />);
    clickAnchor({ href: '/other' }, true);
    expect(np.done).toHaveBeenCalled();
  });

  it('別ページへの通常リンクは何もしない(Next.js の遷移に任せる)', () => {
    render(<NextNProgress />);
    clickAnchor({ href: '/other' });
    expect(np.start).not.toHaveBeenCalled();
  });

  it('同一ページ内のアンカー・外部リンク・target=_blank は無視する', () => {
    render(<NextNProgress />);
    clickAnchor({ href: `${window.location.origin}/current#section` }, true);
    clickAnchor({ href: 'https://other.example.org/' }, true);
    clickAnchor({ href: '/other', target: '_blank' }, true);
    expect(np.start).not.toHaveBeenCalled();
  });

  it('リンクでない要素のクリックは無視する', () => {
    render(<NextNProgress />);
    np.start.mockClear();
    fireEvent.click(document.body);
    expect(np.start).not.toHaveBeenCalled();
  });

  it('URL の解析に失敗しても進捗を終わらせる', () => {
    render(<NextNProgress />);
    np.start.mockClear();
    np.done.mockClear();
    const a = document.createElement('a');
    document.body.appendChild(a);
    Object.defineProperty(a, 'href', { value: 'http://[invalid' });
    fireEvent.click(a);
    expect(np.start).toHaveBeenCalledTimes(1);
    expect(np.done).toHaveBeenCalledTimes(1);
  });

  it('アンマウントでクリックリスナーを外す', () => {
    const { unmount } = render(<NextNProgress />);
    unmount();
    clickAnchor({ href: window.location.href });
    expect(np.start).not.toHaveBeenCalled();
  });
});
