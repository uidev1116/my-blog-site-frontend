'use client';

import { ReactNode } from 'react';
import { useLightbox } from './LightboxContext';
import clsx from 'clsx';

interface Props {
  index: number;
  children: ReactNode;
  className?: string;
}

export default function LightboxTrigger({
  index,
  children,
  className = '',
}: Props) {
  const { openLightbox } = useLightbox();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        openLightbox(index);
      }}
      className={clsx(
        'inline-block cursor-pointer appearance-none border-0 bg-transparent p-0',
        className,
      )}
      aria-label="画像を拡大表示する"
    >
      {children}
    </button>
  );
}
