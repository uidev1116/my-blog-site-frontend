import type { Unit } from '..';
import type { UnitInterface } from './interfaces';

export interface BreakUnit extends UnitInterface {
  label?: string;
  url?: string;
}

export const isBreakUnit = (unit: Unit): unit is Unit<BreakUnit> => {
  return unit.type === 'break';
};
