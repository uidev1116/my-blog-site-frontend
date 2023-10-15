import { formatISO9075, format } from 'date-fns';
import { Badge } from '..';
import type { Tag } from '@/app/types';

type Props = {
  title: string;
  description?: string;
  datetime: Date;
  tags?: Tag[];
};

export default function Card({
  title = '',
  description = '',
  datetime,
  tags = [],
}: Props) {
  return (
    <div className="flex w-full flex-col gap-y-2 rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div className="flex items-center justify-between">
        <time
          dateTime={formatISO9075(datetime)}
          className="text-sm font-light text-gray-600 dark:text-gray-400"
        >
          {format(datetime, 'yyyy/MM/dd')}
        </time>
      </div>
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        {description}
      </p>
      {tags.length > 0 && (
        <div>
          <ul className="inline-flex flex-wrap gap-x-2">
            {tags.map((tag) => (
              <li key={tag.name}>
                <Badge>{tag.name}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
