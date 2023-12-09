import { Suspense } from 'react';
import { getGaTrackingId } from '@/app/api';
import AnalyticsScript from './AnalyticsScript';

export default async function GoogleAnalytics() {
  const trackingId = await getGaTrackingId();

  if (trackingId === '') {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <AnalyticsScript trackingId={trackingId} />
    </Suspense>
  );
}
