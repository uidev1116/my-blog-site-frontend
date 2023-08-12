import { formatISO9075, format } from 'date-fns';

type Props = {
  title: string;
  description?: string;
  datetime: Date;
  tags?: { name: string; url: string }[];
};

export default function Card({
  title = '',
  description = '',
  datetime,
  tags = [],
}: Props) {
  return (
    <div className="flex flex-col gap-y-2 rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div className="flex items-center justify-between">
        <time
          dateTime={formatISO9075(datetime)}
          className="text-sm font-light text-gray-600 dark:text-gray-400"
        >
          {format(datetime, 'yyyy年MM月dd日')}
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
                <span className="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  {tag.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
