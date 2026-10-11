'use client';

import { usePageChange } from '@/app/hooks';
import { applyBuildIn } from '@/app/lib/buildIn';
import { Suspense } from 'react';

function BuildInJs() {
  usePageChange(() => {
    if (typeof window !== 'undefined') {
      applyBuildIn(document);
    }
  });
  return null;
}

export default function BuildInJsSuspense() {
  return (
    <Suspense fallback={null}>
      <BuildInJs />
    </Suspense>
  );
}
