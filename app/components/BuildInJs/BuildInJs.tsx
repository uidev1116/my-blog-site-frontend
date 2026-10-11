'use client';

import { usePageChange } from '@/app/hooks';
import { setupBuildInJs } from '@/app/lib/buildIn';
import { Suspense } from 'react';

function BuildInJs() {
  usePageChange(() => {
    if (typeof window !== 'undefined') {
      setupBuildInJs(document);
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
