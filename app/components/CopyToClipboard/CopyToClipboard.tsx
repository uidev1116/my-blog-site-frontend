import { Children, cloneElement, isValidElement, useCallback } from 'react';
import {
  useClipboard,
  type UseClipboardOptions,
} from '@/app/hooks/useClipboard';

interface CopyToClipboardProps extends UseClipboardOptions {
  children: React.ReactNode;
  text: string;
}

const CopyToClipboard = ({
  children,
  text,
  ...options
}: CopyToClipboardProps) => {
  const { copy } = useClipboard(options);
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      const element = Children.only(children);
      copy(text);

      // Bypass onClick if it was present
      if (
        isValidElement(element) &&
        element.props &&
        // @ts-expect-error onClick is not typed
        typeof element.props.onClick === 'function'
      ) {
        // @ts-expect-error onClick is not typed
        element.props.onClick(event);
      }
    },
    [copy, children, text],
  );

  // 子要素が単一の React 要素でなければ Children.only が例外を投げる
  const element = Children.only(children);

  // @ts-expect-error onClick is not typed
  return cloneElement(element, { ...element.props, onClick: handleClick });
};

export default CopyToClipboard;
