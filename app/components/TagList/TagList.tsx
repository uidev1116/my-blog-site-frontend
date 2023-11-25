import { Tag } from '@/app/types';
import { Badge, ConditionalWrapper } from '..';
import Link from 'next/link';

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
            wrapper={(children) => <Link href={tag.path}>{children}</Link>}
          >
            <Badge>{tag.name}</Badge>
          </ConditionalWrapper>
        </li>
      ))}
    </ul>
  );
}
