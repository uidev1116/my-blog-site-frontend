import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface OpenStreetMapUnit extends UnitInterface {
  x: number;
  y: number;
  message: string;
  lat: number;
  lng: number;
  zoom: number;
  displaySize: string;
}

export const isOpenStreetMapUnit = (
  unit: Unit,
): unit is Unit<OpenStreetMapUnit> => {
  return unit.type === 'osmap';
};
