import type { UnitType, UnitAlign } from './enums';
import type { UnitInterface } from './units/interfaces';

export type Unit<T extends UnitInterface = UnitInterface> = T & {
  id: number;
  type: UnitType;
  sort: number;
  align: UnitAlign;
  attr: string;
  group: string;
  unitGroup: {
    open: boolean;
    close: boolean;
  };
};
