import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface TableUnit extends UnitInterface {
  table: string;
}

export const isTableUnit = (unit: Unit): unit is Unit<TableUnit> => {
  return unit.type === 'table';
};
