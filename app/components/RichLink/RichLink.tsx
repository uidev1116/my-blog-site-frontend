import clsx from 'clsx';
import { forwardRef } from 'react';

type Props = React.ComponentPropsWithoutRef<'a'> & {
  siteName: string;
  title: string;
  description: string;
  imageSrc: string;
};

export default forwardRef<HTMLAnchorElement, Props>(function RichLink(
  { className, imageSrc, siteName, title, description, ...anchorProps },
  ref,
) {
  return (
    <a
      className={clsx(
        'text-card-foreground block overflow-hidden rounded-lg border bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700',
        className,
      )}
      ref={ref}
      {...anchorProps}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="h-[120px] w-[120px] md:h-[157px] md:w-auto md:max-w-[256px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="h-full w-full object-cover"
              src={imageSrc}
              alt={`${siteName}のサムネイル画像`}
            />
          </div>
        </div>
        <div className="flex flex-col justify-between p-4">
          <div className="space-y-2">
            <h3 className="line-clamp-1 text-base font-medium leading-tight tracking-tight text-black hover:underline md:line-clamp-2">
              {title}
            </h3>
            <p className="line-clamp-2 text-sm text-gray-500">{description}</p>
          </div>
          <div className="flex justify-end">
            <p className="text-sm text-gray-500">{siteName}</p>
          </div>
        </div>
      </div>
    </a>
  );
});
