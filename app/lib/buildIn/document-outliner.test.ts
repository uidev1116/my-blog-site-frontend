// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { makeList, DocumentOutliner } = vi.hoisted(() => {
  const makeList = vi.fn();
  return {
    makeList,
    DocumentOutliner: vi.fn(function () {
      return { makeList };
    }),
  };
});
vi.mock('document-outliner', () => ({ default: DocumentOutliner }));

import setupDocumentOutliner from './document-outliner';

beforeEach(() => {
  document.body.innerHTML = '<article id="body"></article>';
  makeList.mockClear();
  DocumentOutliner.mockClear();
  vi.stubGlobal('requestAnimationFrame', (cb: () => void) => cb());
});

const outline = (attrs: Record<string, string>) => {
  const el = document.createElement('div');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

describe('setupDocumentOutliner', () => {
  it('data-target が無ければ何もしない', () => {
    setupDocumentOutliner(outline({}));
    expect(DocumentOutliner).not.toHaveBeenCalled();
  });

  it('data-target の要素が存在しなければ何もしない', () => {
    setupDocumentOutliner(outline({ 'data-target': '#missing' }));
    expect(DocumentOutliner).not.toHaveBeenCalled();
  });

  it('既定値・引数・data 属性の順で上書きし、数値と真偽値は型変換する', () => {
    const el = outline({
      'data-target': '#body',
      'data-levelLimit': '3',
      'data-link': 'false',
      'data-listType': 'ul',
    });

    setupDocumentOutliner(el, { exceptClass: 'skip', link: true });

    expect(DocumentOutliner).toHaveBeenCalledWith(el);
    expect(makeList).toHaveBeenCalledWith(
      '#body',
      expect.objectContaining({
        exceptClass: 'skip',
        levelLimit: 3,
        link: false,
        listType: 'ul',
      }),
    );
  });

  it('data 属性が無ければ既定値を使う', () => {
    setupDocumentOutliner(outline({ 'data-target': '#body' }));
    expect(makeList.mock.calls[0][1]).toMatchObject({
      levelLimit: 5,
      link: true,
      listType: 'ol',
    });
  });
});
