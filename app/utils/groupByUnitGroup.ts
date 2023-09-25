import type { Unit } from '../types';

export default function groupByUnitGroup(units: Unit[]) {
  return units.reduce((arr: (Unit | Unit[])[], current: Unit) => {
    const prev = arr.at(-1);

    if (current.unitGroup.open === true) {
      return [...arr, [current]];
    }

    if (
      prev &&
      Array.isArray(prev) &&
      prev[prev.length - 1].unitGroup.close === false
    ) {
      return [...arr.slice(0, -1), [...prev, current]];
    }

    return [...arr, current];
  }, []);
}
