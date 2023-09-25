import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface VideoUnit extends UnitInterface {
  x: number;
  y: number;
  videoId: string;
  displaySize: string;
}

export const isVideoUnit = (unit: Unit): unit is Unit<VideoUnit> => {
  return unit.type === 'video';
};
