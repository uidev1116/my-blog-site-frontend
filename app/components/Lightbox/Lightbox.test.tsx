// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// ライトボックス本体(ライブラリ)は、開閉状態と slides の受け渡しだけ確認できる形に差し替える
vi.mock('yet-another-react-lightbox', () => ({
  default: ({
    open,
    index,
    close,
    slides,
  }: {
    open: boolean;
    index: number;
    close: () => void;
    slides: { src: string }[];
  }) =>
    open ? (
      <div role="dialog" data-index={index}>
        {slides.map((s) => (
          <span key={s.src}>{s.src}</span>
        ))}
        <button onClick={close}>閉じる</button>
      </div>
    ) : null,
}));
vi.mock('yet-another-react-lightbox/styles.css', () => ({}));
vi.mock('yet-another-react-lightbox/plugins/zoom', () => ({ default: {} }));
vi.mock('yet-another-react-lightbox/plugins/thumbnails', () => ({
  default: {},
}));
vi.mock('yet-another-react-lightbox/plugins/thumbnails.css', () => ({}));
vi.mock('./NextJsImage', () => ({ default: () => null }));

import LightboxProvider from './LightboxProvider';
import LightboxTrigger from './LightboxTrigger';
import { useLightbox } from './LightboxContext';

describe('Lightbox', () => {
  it('トリガーをクリックすると該当インデックスで開き、閉じられる', () => {
    render(
      <LightboxProvider slides={[{ src: '/a.png' }, { src: '/b.png' }]}>
        <LightboxTrigger index={1} className="extra">
          画像
        </LightboxTrigger>
      </LightboxProvider>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();

    const trigger = screen.getByRole('button', { name: '画像を拡大表示する' });
    expect(trigger).toHaveClass('extra');
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toHaveAttribute('data-index', '1');
    expect(screen.getByText('/a.png')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('トリガーのクリックでデフォルト動作 (リンク遷移など) を止める', () => {
    render(
      <LightboxProvider slides={[]}>
        <LightboxTrigger index={0}>a</LightboxTrigger>
      </LightboxProvider>,
    );
    expect(fireEvent.click(screen.getByRole('button'))).toBe(false);
  });

  it('Provider の外で useLightbox を使うと例外になる', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(<LightboxTrigger index={0}>a</LightboxTrigger>),
    ).toThrow('useLightbox must be used within a LightboxProvider');
    spy.mockRestore();
  });

  it('useLightbox は openLightbox を返す', () => {
    function Probe() {
      const { openLightbox } = useLightbox();
      return <button onClick={() => openLightbox(0)}>open</button>;
    }
    render(
      <LightboxProvider slides={[{ src: '/a.png' }]}>
        <Probe />
      </LightboxProvider>,
    );
    fireEvent.click(screen.getByText('open'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
