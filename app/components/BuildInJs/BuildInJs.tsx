'use client';

import { usePageChange } from '@/app/hooks';
import {
  documentOutliner,
  externalLinks,
  openStreetMap,
  scrollHint,
  smartPhoto,
} from '@/app/lib/buildIn';
import { Suspense } from 'react';

function BuildInJs() {
  usePageChange(() => {
    if (typeof window !== 'undefined') {
      ((context: Document | Element) => {
        externalLinks(context);
        smartPhoto(context);
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
