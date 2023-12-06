import type { Unit, TableUnit } from '@/app/types';

export default function TableUnit({ table }: Unit<TableUnit>) {
  return (
    <div>
      <div
        className="my-[2em] overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: table }}
      />
    </div>
  );
}
