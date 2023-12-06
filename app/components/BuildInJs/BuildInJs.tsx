'use client';

import {
  documentOutliner,
  externalLinks,
  openStreetMap,
  scrollHint,
  smartPhoto,
} from '@/app/lib/buildIn';
import { useEffect } from 'react';

export default function BuildInJs() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ((context: Document | Element) => {
        externalLinks(context);
        smartPhoto(context);
        scrollHint(context);
        openStreetMap(context);
        documentOutliner(context);
      })(document);
    }
  }, []);
  return null;
}
