// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const L = vi.hoisted(() => {
  const popup = vi.fn();
  const marker = { addTo: vi.fn(), bindPopup: popup };
  marker.addTo.mockReturnValue(marker);
  const map = { setView: vi.fn(), getCenter: vi.fn(() => [1, 2]) };
  map.setView.mockReturnValue(map);
  return {
    popup,
    marker,
    map,
    mapFn: vi.fn(() => map),
    markerFn: vi.fn(() => marker),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    mergeOptions: vi.fn(),
  };
});
vi.mock('leaflet', () => ({
  default: {
    map: L.mapFn,
    marker: L.markerFn,
    tileLayer: L.tileLayer,
    Icon: {
      Default: { prototype: { _getIconUrl: 1 }, mergeOptions: L.mergeOptions },
    },
  },
}));
vi.mock('leaflet/dist/images/marker-icon.png', () => ({
  default: { src: 'i' },
}));
vi.mock('leaflet/dist/images/marker-icon-2x.png', () => ({
  default: { src: 'i2' },
}));
vi.mock('leaflet/dist/images/marker-shadow.png', () => ({
  default: { src: 's' },
}));
vi.mock('leaflet/dist/leaflet.css', () => ({}));

import setupOpenStreetMap from './open-street-map';

const el = (attrs: Record<string, string>) => {
  const e = document.createElement('div');
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
};

beforeEach(() => {
  vi.clearAllMocks();
  L.map.getCenter.mockReturnValue([1, 2]);
  L.marker.addTo.mockReturnValue(L.marker);
});

describe('setupOpenStreetMap', () => {
  it('単一マーカー: 中心にマーカーを置きメッセージをポップアップにする', () => {
    const e = el({
      'data-lat': '35',
      'data-lng': '139',
      'data-zoom': '10',
      'data-msg': 'こんにちは',
    });
    setupOpenStreetMap(e);

    expect(L.mapFn).toHaveBeenCalledWith(e);
    expect(L.map.setView).toHaveBeenCalledWith([35, 139], 10);
    expect(L.markerFn).toHaveBeenCalledWith([1, 2], { draggable: false });
    expect(L.popup).toHaveBeenCalledWith('こんにちは');
    expect(L.mergeOptions).toHaveBeenCalledWith({
      iconUrl: 'i',
      iconRetinaUrl: 'i2',
      shadowUrl: 's',
    });
    expect(e.getAttribute('data-already')).toBe('true');
  });

  it('メッセージが無ければポップアップを付けない', () => {
    setupOpenStreetMap(
      el({ 'data-lat': '1', 'data-lng': '2', 'data-zoom': '3' }),
    );
    expect(L.popup).not.toHaveBeenCalled();
  });

  it('複数マーカー: 座標ごとにマーカーを置き、不正な座標は無視する', () => {
    setupOpenStreetMap(
      el({
        'data-lat': '1',
        'data-lng': '2',
        'data-zoom': '3',
        'data-multiple': '1',
        'data-markers': '10, 20|30,40|bad|50,60',
        'data-messages': 'A[[:split:]]B',
      }),
    );

    expect(L.markerFn).toHaveBeenCalledTimes(3);
    expect(L.markerFn).toHaveBeenNthCalledWith(1, [10, 20], {
      draggable: false,
    });
    expect(L.markerFn).toHaveBeenNthCalledWith(2, [30, 40], {
      draggable: false,
    });
    // メッセージは先頭 2 件のみ。3 件目は無し
    expect(L.popup).toHaveBeenCalledTimes(2);
    expect(L.popup).toHaveBeenNthCalledWith(1, 'A');
    expect(L.popup).toHaveBeenNthCalledWith(2, 'B');
  });

  it('初期化済みの要素は再初期化しない', () => {
    setupOpenStreetMap(el({ 'data-already': 'true' }));
    expect(L.mapFn).not.toHaveBeenCalled();
  });
});
