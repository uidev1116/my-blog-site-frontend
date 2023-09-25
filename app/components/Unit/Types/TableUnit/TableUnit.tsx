import type { Unit, TableUnit } from '@/app/types';

export default function TableUnit({ align, table }: Unit<TableUnit>) {
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: table }} />
    </div>
  );
}
