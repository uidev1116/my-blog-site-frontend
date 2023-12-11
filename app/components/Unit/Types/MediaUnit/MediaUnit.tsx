import Image from 'next/image';
import nl2br from 'react-nl2br';
import { ConditionalWrapper } from '../../..';
import type { Unit, MediaUnit } from '@/app/types';
import { ASSETS_HOST, MEDIA_BASE_URL } from '@/app/config/acms';

export default function MediaUnit({ media }: Unit<MediaUnit>) {
  const render = () => {
    if (media.type === 'image' || media.type === 'svg') {
      const { pathname } = new URL(media.link);
      return (
        <>
          <ConditionalWrapper
            condition={media.link !== ''}
            wrapper={(children) => (
              <a
                href={new URL(pathname, ASSETS_HOST).toString()}
                className="js-smartphoto"
                data-group={media.eid}
                data-caption={media.caption.replace(/\r?\n/g, '')}
              >
                {children}
              </a>
            )}
          >
            <Image
              src={new URL(media.path, MEDIA_BASE_URL).toString()}
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
                src={new URL(media.path, MEDIA_BASE_URL).toString()}
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
