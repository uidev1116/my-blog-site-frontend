'use client';
import { useEffect } from 'react';
import { initCollapses } from 'flowbite';

import type { ComponentProps } from 'react';

type Props = Omit<
  ComponentProps<'button'>,
  'type' | 'aria-controls' | 'aria-expanded' | 'data-collapse-toggle'
> & {
  toggle: string;
  expanded?: boolean;
  children?: React.ReactNode;
};

export default function Collapse({
  toggle,
  expanded = false,
  children,
  ...props
}: Props) {
  useEffect(() => {
    initCollapses();
  }, []);
  return (
    <button
      type="button"
      data-collapse-toggle={toggle}
      aria-controls={toggle}
      aria-expanded={expanded}
      {...props}
    >
      {children}
    </button>
  );
}
