import { useEffect, useState } from 'react';

export default function useBrowser() {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    // Only run once on mount to detect browser environment
    // This is a legitimate use case for setState in useEffect
    // to avoid hydration mismatch between SSR and client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsBrowser(true);
  }, []); // Empty deps array - only run on mount

  return isBrowser;
}
