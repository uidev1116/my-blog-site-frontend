import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface ExImageUnit extends UnitInterface {
  x: number;
  y: number;
  caption: string;
  path: string;
  largePath: string;
  link: string;
  alt: string;
  displaySize: string;
}

export const isExImageUnit = (unit: Unit): unit is Unit<ExImageUnit> => {
  return unit.type === 'eximage';
};
