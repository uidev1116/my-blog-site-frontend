import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface ModuleUnit extends UnitInterface {
  view: string;
}

export const isModuleUnit = (unit: Unit): unit is Unit<ModuleUnit> => {
  return unit.type === 'module';
};
