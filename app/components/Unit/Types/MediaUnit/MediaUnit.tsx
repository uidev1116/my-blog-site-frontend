import Image from 'next/image';
import nl2br from 'react-nl2br';
import { ConditionalWrapper } from '../../..';
import type { Unit, MediaUnit } from '@/app/types';
import { MEDIA_BASE_URL } from '@/app/config/acms';

export default function MediaUnit({ media }: Unit<MediaUnit>) {
  const render = () => {
    if (media.type === 'image' || media.type === 'svg') {
      return (
        <>
          <ConditionalWrapper
            condition={media.link !== ''}
            wrapper={(children) => (
              <a
                href={media.link}
                className="js-smartphoto"
                data-group={media.eid}
                data-caption={media.caption.replace(/\r?\n/g, '')}
              >
                {children}
              </a>
            )}
          >
            <Image
              src={`${MEDIA_BASE_URL}${media.path}`}
              width={media.x}
              height={media.y || undefined}
              alt={media.alt}
            />
          </ConditionalWrapper>
          {media.caption && <p>{nl2br(media.caption)}</p>}
        </>
      );
    } else if (media.type === 'file') {
      return (
        <>
          <a href={media.link} target="_blank" rel="noreferrer noopener">
            {media.thumbnail && media.useIcon === false ? (
              <Image
                src={`${MEDIA_BASE_URL}${media.thumbnail}`}
                alt={media.alt}
              />
            ) : (
              <Image className="columnIcon" src="icon" alt={media.alt} />
            )}
          </a>
          {media.caption && <p>{nl2br(media.caption)}</p>}
        </>
      );
    }
  };
  return <div>{render()}</div>;
}
