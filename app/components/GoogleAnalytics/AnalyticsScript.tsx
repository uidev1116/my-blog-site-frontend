'use client';

import Script from 'next/script';
import { usePageChange } from '@/app/hooks';
import { pageview } from '@/app/lib/gtag';

type Props = {
  trackingId: string;
};

export default function AnalyticsScript({ trackingId }: Props) {
  usePageChange((pathname, searchParams) => {
    if (!trackingId) {
      return;
    }
    pageview(trackingId, `${pathname}${searchParams}`);
  });

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
