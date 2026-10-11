import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import loadFont from './loadFont';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

const cssWith = (url: string) =>
  `@font-face { src: url(${url}) format('truetype'); }`;

describe('loadFont', () => {
  it('CSS からフォント URL を取り出して ArrayBuffer を返す', async () => {
    const buffer = new ArrayBuffer(4);
    fetchMock
      .mockResolvedValueOnce({ text: async () => cssWith('https://f/a.ttf') })
      .mockResolvedValueOnce({ arrayBuffer: async () => buffer });

    const res = await loadFont({
      family: 'Noto Sans JP',
      weight: 700,
      text: 'あ',
    });

    expect(res).toBe(buffer);
    const cssUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(cssUrl.searchParams.get('family')).toBe('Noto Sans JP:wght@700');
    expect(cssUrl.searchParams.get('text')).toBe('あ');
    expect(cssUrl.searchParams.has('subset')).toBe(false);
    expect(fetchMock.mock.calls[1][0]).toBe('https://f/a.ttf');
  });

  it('text も weight も無ければ latin サブセットを指定する', async () => {
    fetchMock
      .mockResolvedValueOnce({ text: async () => cssWith('https://f/a.ttf') })
      .mockResolvedValueOnce({ arrayBuffer: async () => new ArrayBuffer(0) });

    await loadFont({ family: 'Inter' });

    const cssUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(cssUrl.searchParams.get('family')).toBe('Inter');
    expect(cssUrl.searchParams.get('subset')).toBe('latin');
  });

  it('CSS にフォント URL が無ければ例外を投げる', async () => {
    fetchMock.mockResolvedValueOnce({ text: async () => '' });
    await expect(loadFont({ family: 'Inter' })).rejects.toThrow(
      'Font file not found',
    );
  });
});
