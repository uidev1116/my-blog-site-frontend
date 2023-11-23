import { Tag } from '@/app/types';
import { Badge } from '..';

type Props = {
  tags: Tag[];
};

export default function TagList({ tags = [] }: Props) {
  return (
    <ul className="inline-flex flex-wrap gap-x-2">
      {tags.map((tag) => (
        <li key={tag.name}>
          <Badge>{tag.name}</Badge>
        </li>
      ))}
    </ul>
  );
}
