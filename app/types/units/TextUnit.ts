import type { Unit } from '..';
import { UnitInterface } from './interfaces';

export interface TextUnit extends UnitInterface {
  text: string;
  tag:
    | 'p'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'ul'
    | 'ol'
    | 'dl'
    | 'blockquote'
    | 'table'
    | 'pre'
    | 'none'
    | 'markdown'
    | 'wysiwyg';
  extendTag: string;
}

export const isTextUnit = (unit: Unit): unit is Unit<TextUnit> => {
  return unit.type === 'text';
};
