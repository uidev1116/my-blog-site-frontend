import { useEffect, useState } from 'react';

export default function useBrowser() {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
  });

  return isBrowser;
}
