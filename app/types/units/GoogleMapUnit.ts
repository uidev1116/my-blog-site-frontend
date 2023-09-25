import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface GoogleMapUnit extends UnitInterface {
  x: number;
  y: number;
  message: string;
  lat: number;
  lng: number;
  zoom: number;
  displaySize: string;
  view: {
    pitch: number;
    zoom: number;
    heading: number;
  };
}

export const isGoogleMapUnit = (unit: Unit): unit is Unit<GoogleMapUnit> => {
  return unit.type === 'map';
};
