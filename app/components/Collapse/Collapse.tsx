'use client';

import { Suspense, useEffect } from 'react';
import { initCollapses } from 'flowbite';

import type { ComponentProps } from 'react';
import { usePageChange } from '@/app/hooks';

type Props = Omit<
  ComponentProps<'button'>,
  'type' | 'aria-controls' | 'aria-expanded' | 'data-collapse-toggle'
> & {
  toggle: string;
  children?: React.ReactNode;
};

function Collapse({ toggle, children, ...props }: Props) {
  useEffect(() => {
    initCollapses();
  }, []);

  usePageChange(() => {
    // @ts-expect-error FlowbiteInstances はグローバルで、型定義がない
    const collapse = FlowbiteInstances.getInstance('Collapse', toggle);
    collapse.collapse();
  });

  return (
    <button
      type="button"
      data-collapse-toggle={toggle}
      aria-controls={toggle}
      aria-expanded="false"
      {...props}
    >
      {children}
    </button>
  );
}

export default function CollapseSuspense(props: Props) {
  return (
    <Suspense fallback={null}>
      <Collapse {...props} />
    </Suspense>
  );
}
