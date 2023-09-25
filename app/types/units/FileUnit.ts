import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface FileUnit extends UnitInterface {
  caption: string;
  path: string;
  iconPath: string;
  x: number;
  y: number;
}

export const isFileUnit = (unit: Unit): unit is Unit<FileUnit> => {
  return unit.type === 'file';
};
