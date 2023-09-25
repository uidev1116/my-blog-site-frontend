import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface ImageUnit extends UnitInterface {
  caption: string;
  path: string;
  x: number | null;
  y: number | null;
  link: string;
  alt: string;
  displaySize: string;
  exif: string;
  tinyPath?: string;
  tinyX?: number;
  tinyY?: number;
  squarePath?: string;
  squareX?: number;
  squareY?: number;
  largePath?: string;
  largeX?: number;
  largeY?: number;
}

export const isImageUnit = (unit: Unit): unit is Unit<ImageUnit> => {
  return unit.type === 'image';
};
