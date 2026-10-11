// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  setupScrollHint: vi.fn(),
  setupMap: vi.fn(),
  setupOutliner: vi.fn(),
  lazyLoadFn: vi.fn(),
}));
vi.mock('dom-content-loaded', () => ({
  default: (fn: () => unknown) => fn(),
}));
vi.mock('./scroll-hint', () => ({ default: m.setupScrollHint }));
vi.mock('./open-street-map', () => ({ default: m.setupMap }));
vi.mock('./document-outliner', () => ({ default: m.setupOutliner }));
vi.mock('./lazy-load-fn', () => ({ default: m.lazyLoadFn }));

import {
  setupBuildInJs,
  documentOutliner,
  externalLinks,
  openStreetMap,
  scrollHint,
} from './index';

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  document.body.innerHTML = '';
  Object.values(m).forEach((fn) => fn.mockReset());
});

describe('externalLinks', () => {
  it('外部リンクに target と rel を付け、内部・特殊リンクはそのまま', () => {
    document.body.innerHTML = `
      <a id="ext" href="https://other.example.org/">ext</a>
      <a id="self" href="http://${window.location.hostname}/x">self</a>
      <a id="rel" href="/relative">rel</a>
      <a id="tel" href="tel:0000">tel</a>
      <a id="js" href="javascript:void(0)">js</a>
      <a id="blank" href="https://other.example.org/" target="_self">t</a>
      <a id="nohref">n</a>
      <a id="query" href="https://other.example.org/?ref=${window.location.hostname}">q</a>`;

    externalLinks(document);

    const ext = document.getElementById('ext')!;
    expect(ext.getAttribute('target')).toBe('_blank');
    expect(ext.getAttribute('rel')).toBe('noopener noreferrer');
    for (const id of ['self', 'rel', 'tel', 'js', 'blank', 'nohref']) {
      expect(document.getElementById(id)!.getAttribute('rel')).toBeNull();
    }
    // クエリにホスト名を含むだけの別ホストは外部リンク
    expect(document.getElementById('query')!.getAttribute('target')).toBe(
      '_blank',
    );
    expect(document.getElementById('blank')!.getAttribute('target')).toBe(
      '_self',
    );
  });
});

describe('scrollHint', () => {
  it('対象要素があれば両方のセレクタでセットアップする', async () => {
    document.body.innerHTML = '<div class="js-scroll-hint"></div>';
    scrollHint(document, { suggestClass: 'x' });
    await flush();
    expect(m.setupScrollHint).toHaveBeenCalledTimes(2);
    expect(m.setupScrollHint).toHaveBeenCalledWith('.js-scroll-hint', {
      suggestClass: 'x',
    });
    expect(m.setupScrollHint).toHaveBeenCalledWith(
      '.js-table-unit-scroll-hint',
      { suggestClass: 'x', applyToParents: true },
    );
  });

  it('テーブル用クラスだけでもセットアップする', async () => {
    document.body.innerHTML = '<div class="js-table-unit-scroll-hint"></div>';
    scrollHint(document);
    await flush();
    expect(m.setupScrollHint).toHaveBeenCalledTimes(2);
  });

  it('対象が無ければ何もしない', async () => {
    scrollHint(document);
    await flush();
    expect(m.setupScrollHint).not.toHaveBeenCalled();
  });
});

describe('openStreetMap', () => {
  it('対象があれば lazyLoadFn 経由で地図を初期化する', async () => {
    document.body.innerHTML =
      '<div class="js-open-street-map" data-lazy="true"></div>';
    m.lazyLoadFn.mockImplementation(async (_sel, isLazy, run) => {
      const el = document.querySelector('.js-open-street-map') as HTMLElement;
      expect(isLazy(el)).toBe(true);
      await run(el);
    });

    openStreetMap(document);
    await flush();

    expect(m.lazyLoadFn.mock.calls[0][0]).toBe('.js-open-street-map');
    expect(m.setupMap).toHaveBeenCalledTimes(1);
  });

  it('セレクタを指定できる', async () => {
    document.body.innerHTML = '<div class="map"></div>';
    openStreetMap(document, '.map');
    await flush();
    expect(m.lazyLoadFn.mock.calls[0][0]).toBe('.map');
  });

  it('対象が無ければ何もしない', async () => {
    openStreetMap(document);
    await flush();
    expect(m.lazyLoadFn).not.toHaveBeenCalled();
  });
});

describe('documentOutliner', () => {
  it('対象ごとにセットアップする', async () => {
    document.body.innerHTML =
      '<div class="js-outline"></div><div class="js-outline"></div>';
    documentOutliner(document, undefined, { link: false });
    await flush();
    expect(m.setupOutliner).toHaveBeenCalledTimes(2);
    expect(m.setupOutliner.mock.calls[0][1]).toEqual({ link: false });
  });

  it('対象が無ければ何もしない', async () => {
    documentOutliner(document);
    await flush();
    expect(m.setupOutliner).not.toHaveBeenCalled();
  });
});

describe('setupBuildInJs', () => {
  it('外部リンク・スクロールヒント・地図・目次を、まとめて適用する', async () => {
    document.body.innerHTML = `
      <a id="ext" href="https://other.example.org/">ext</a>
      <div class="js-outline" data-target=".x"></div>
      <div class="js-open-street-map"></div>
      <div class="js-scrollable"></div>
    `;

    m.lazyLoadFn.mockImplementation(async (_sel, _isLazy, run) => {
      await run(document.querySelector('.js-open-street-map'));
    });

    setupBuildInJs(document);
    await flush();

    expect(document.getElementById('ext')?.getAttribute('target')).toBe(
      '_blank',
    );
    expect(m.setupOutliner).toHaveBeenCalledTimes(1);
    expect(m.setupMap).toHaveBeenCalled();
  });
});
