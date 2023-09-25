import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface RichEditorUnit extends UnitInterface {
  html: string;
}

export const isRichEditorUnit = (unit: Unit): unit is Unit<RichEditorUnit> => {
  return unit.type === 'rich-editor';
};
