import type { Unit, TableUnit } from '@/app/types';

export default function TableUnit({ table }: Unit<TableUnit>) {
  return (
    <div>
      <div
        className="my-[1.5em] overflow-x-auto sm:my-[2em] lg:my-[1.7777778em]"
        dangerouslySetInnerHTML={{ __html: table }}
      />
    </div>
  );
}
