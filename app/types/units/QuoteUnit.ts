import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface QuoteUnit extends UnitInterface {
  siteName: string;
  author: string;
  title: string;
  description: string;
  image: string;
  url: string;
  html: string;
}

export const isQuoteUnit = (unit: Unit): unit is Unit<QuoteUnit> => {
  return unit.type === 'quote';
};
