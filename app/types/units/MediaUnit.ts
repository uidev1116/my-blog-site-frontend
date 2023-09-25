import type { Media, Unit } from '..';
import { UnitInterface } from './interfaces';

export interface MediaUnit extends UnitInterface {
  media: Media & {
    x: number;
    y: number | null;
    useIcon?: boolean;
    eid?: number;
  };
  displaySize: string;
}

export const isMediaUnit = (unit: Unit): unit is Unit<MediaUnit> => {
  return unit.type === 'media';
};
