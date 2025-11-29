'use client';

import { usePageChange } from '@/app/hooks';
import {
  documentOutliner,
  externalLinks,
  openStreetMap,
  scrollHint,
} from '@/app/lib/buildIn';
import { Suspense } from 'react';

function BuildInJs() {
  usePageChange(() => {
    if (typeof window !== 'undefined') {
      ((context: Document | Element) => {
        externalLinks(context);
        scrollHint(context);
        openStreetMap(context);
        documentOutliner(context);
      })(document);
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
