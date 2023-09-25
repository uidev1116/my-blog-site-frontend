import { Unit } from '@/app/components';
import type { Unit as UnitType } from '@/app/types';

type Props = {
  units: UnitType[];
};

export default function UnitIndex({ units }: Props) {
  return units.map((unit) => <Unit key={unit.id} unit={unit} />);
}
