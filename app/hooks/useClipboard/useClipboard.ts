import { useCallback, useState } from 'react';
import _copy from 'copy-to-clipboard';

export interface UseClipboardOptions {
  format?: string; // MIME type
  onCopy?: (text: string) => void;
}

/**
 * useClipboard
 */
export default function useClipboard({
  onCopy,
  ...copyToClipboardOptions
}: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (text: string) => {
      const isCopied = _copy(text, copyToClipboardOptions);
      setCopied(isCopied);
      if (isCopied && onCopy) {
        onCopy(text);
      }
    },
    [copyToClipboardOptions, onCopy],
  );

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return { copy, copied, reset };
}
