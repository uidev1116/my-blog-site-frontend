import { RichLink } from '@/app/components';
import type { Unit, QuoteUnit } from '@/app/types';

export default function QuoteUnit({
  siteName,
  title,
  description,
  image,
  url,
}: Unit<QuoteUnit>) {
  return (
    <div className="not-format my-[1.5em] sm:my-[2em] lg:my-[1.7777778em]">
      <RichLink
        href={url}
        siteName={siteName}
        title={title}
        description={description}
        imageSrc={image}
        target="_blank"
        rel="noopener noreferrer"
      />
    </div>
  );
}
