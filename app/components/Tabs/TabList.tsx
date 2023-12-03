import { clsx } from 'clsx';
import { forwardRef } from 'react';

type Props = React.ComponentPropsWithoutRef<'ul'> & {
  children: React.ReactNode;
};

export default forwardRef<HTMLUListElement, Props>(function TabList(
  {
    className = 'border-b border-gray-200 text-center text-sm font-medium text-black dark:border-gray-700 dark:text-white',
    children,
    ...rest
  },
  ref,
) {
  return (
    <ul
      ref={ref}
      className={clsx('-mb-px flex flex-wrap', className)}
      {...rest}
    >
      {children}
    </ul>
  );
});
