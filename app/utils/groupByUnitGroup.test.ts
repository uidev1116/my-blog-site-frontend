import { describe, expect, it } from 'vitest';
import groupByUnitGroup from './groupByUnitGroup';
import type { Unit } from '../types';

const unit = (id: string, open = false, close = false) =>
  ({ id, unitGroup: { open, close } }) as unknown as Unit;

describe('groupByUnitGroup', () => {
  it('空配列は空配列を返す', () => {
    expect(groupByUnitGroup([])).toEqual([]);
  });

  it('グループに属さないユニットはそのまま並ぶ', () => {
    const a = unit('a');
    const b = unit('b');
    expect(groupByUnitGroup([a, b])).toEqual([a, b]);
  });

  it('open から close までを 1 つの配列にまとめる', () => {
    const a = unit('a');
    const o = unit('o', true, false);
    const m = unit('m');
    const c = unit('c', false, true);
    const z = unit('z');
    expect(groupByUnitGroup([a, o, m, c, z])).toEqual([a, [o, m, c], z]);
  });

  it('open と close が同じユニットは単独のグループになる', () => {
    const s = unit('s', true, true);
    const n = unit('n');
    expect(groupByUnitGroup([s, n])).toEqual([[s], n]);
  });
});
