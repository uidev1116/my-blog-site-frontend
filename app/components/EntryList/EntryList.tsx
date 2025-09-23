import { Entry } from '@/app/types';
import Link from 'next/link';
import { Card, CardBody, CardFooter, CardHeader, TagList } from '..';
import { formatISO9075 } from 'date-fns';
import dynamic from 'next/dynamic';

const CreatedTime = dynamic(() =>
  import('@/app/components/CreatedTime').then((mod) => mod.CreatedTime),
);

type Props = {
  entries: Entry[];
  className?: string;
};

export default function EntryList({
  entries = [],
  className = 'grid gap-4 md:grid-cols-2',
}: Props) {
  return (
    <ul className={className}>
      {entries.map((entry) => (
        <li key={entry.id}>
          <article className="h-full">
            <Link href={entry.path}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CreatedTime
                      createdAt={formatISO9075(entry.createdAt)}
                      className="text-sm font-light text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {entry.title}
                  </h3>
                </CardHeader>
                {entry.summary && (
                  <CardBody className="flex-1">
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      {entry.summary}
                    </p>
                  </CardBody>
                )}
                {entry.tags && entry.tags.length > 0 && (
                  <CardFooter>
                    <TagList tags={entry.tags} />
                  </CardFooter>
                )}
              </Card>
            </Link>
          </article>
        </li>
      ))}
    </ul>
  );
}
