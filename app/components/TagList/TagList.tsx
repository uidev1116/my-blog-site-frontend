import { Tag } from '@/app/types';
import { Badge, ConditionalWrapper } from '..';
import Link from 'next/link';
import clsx from 'clsx';

type Props = {
  tags: Tag[];
  isLink?: boolean;
};

export default function TagList({ tags = [], isLink = false }: Props) {
  return (
    <ul className="inline-flex flex-wrap gap-x-2">
      {tags.map((tag) => (
        <li key={tag.name}>
          <ConditionalWrapper
            condition={isLink}
            wrapper={(children) => (
              <Link href={tag.path} className="group">
                {children}
              </Link>
            )}
          >
            <Badge
              className={clsx({
                ['group-hover:bg-yellow-200 group-hover:bg-yellow-300']: isLink,
              })}
            >
              #{tag.name}
            </Badge>
          </ConditionalWrapper>
        </li>
      ))}
    </ul>
  );
}
