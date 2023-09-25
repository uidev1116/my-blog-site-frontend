import {
  isTextUnit,
  isMediaUnit,
  isRichEditorUnit,
  isTableUnit,
} from '@/app/types';
import {
  TextUnit,
  MediaUnit,
  RichEditorUnit,
  TableUnit,
} from '@/app/components';
import type { Unit as UnitType } from '@/app/types';

type Props = {
  unit: UnitType;
};

export default function Unit({ unit }: Props) {
  if (isTextUnit(unit)) {
    return <TextUnit {...unit} />;
  }

  if (isMediaUnit(unit)) {
    return <MediaUnit {...unit} />;
  }

  if (isTableUnit(unit)) {
    return <TableUnit {...unit} />;
  }

  if (isRichEditorUnit(unit)) {
    return <RichEditorUnit {...unit} />;
  }

  return <></>;
}
