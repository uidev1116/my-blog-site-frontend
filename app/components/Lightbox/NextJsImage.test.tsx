// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const lb = vi.hoisted(() => ({ imageFit: 'contain' }));
vi.mock('yet-another-react-lightbox', () => ({
  isImageSlide: (slide: { type?: string }) =>
    slide.type === undefined || slide.type === 'image',
  isImageFitCover: (_slide: unknown, fit: string) => fit === 'cover',
  useLightboxProps: () => ({ carousel: { imageFit: lb.imageFit } }),
}));
vi.mock('next/image', () => ({
  default: ({
    src,
    placeholder,
    blurDataURL,
    sizes,
  }: {
    src: string;
    placeholder?: string;
    blurDataURL?: string;
    sizes: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      src={src}
      data-placeholder={placeholder}
      data-blur={blurDataURL}
      data-sizes={sizes}
    />
  ),
}));

import NextJsImage from './NextJsImage';

const rect = { width: 400, height: 300 };

beforeEach(() => {
  lb.imageFit = 'contain';
  vi.stubGlobal('innerWidth', 800);
});

describe('NextJsImage', () => {
  it('contain: アスペクト比を保って rect に収まるサイズで描画する', () => {
    const { container } = render(
      <NextJsImage
        slide={{ src: '/a.png', width: 1000, height: 500 } as never}
        rect={rect as never}
        offset={0}
      />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    // 幅 400 / 高さ 200 (2:1)
    expect(wrapper.style.width).toBe('400px');
    expect(wrapper.style.height).toBe('200px');
    expect(screen.getByRole('presentation')).toHaveAttribute(
      'data-sizes',
      '50vw',
    );
  });

  it('cover: rect いっぱいに描画する', () => {
    lb.imageFit = 'cover';
    const { container } = render(
      <NextJsImage
        slide={{ src: '/a.png', width: 1000, height: 500 } as never}
        rect={rect as never}
        offset={0}
      />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe('400px');
    expect(wrapper.style.height).toBe('300px');
  });

  it('blurDataURL があれば blur プレースホルダーを使う', () => {
    render(
      <NextJsImage
        slide={
          {
            src: '/a.png',
            width: 10,
            height: 10,
            blurDataURL: 'data:x',
          } as never
        }
        rect={rect as never}
        offset={0}
      />,
    );
    const img = screen.getByRole('presentation');
    expect(img).toHaveAttribute('data-placeholder', 'blur');
    expect(img).toHaveAttribute('data-blur', 'data:x');
  });

  it('幅・高さが数値でないスライドは描画しない', () => {
    const { container } = render(
      <NextJsImage
        slide={{ src: '/a.png' } as never}
        rect={rect as never}
        offset={0}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('画像でないスライドは描画しない', () => {
    const { container } = render(
      <NextJsImage
        slide={{ type: 'video', width: 1, height: 1 } as never}
        rect={rect as never}
        offset={0}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
