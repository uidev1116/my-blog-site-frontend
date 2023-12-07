import clsx from 'clsx';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

type Props = ComponentPropsWithoutRef<'span'> & {
  as?: React.ElementType;
  chidren?: React.ReactNode;
};

export default forwardRef<HTMLSpanElement, Props>(function Badge(
  { as: Component = 'span', className, children, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={clsx(
        'rounded bg-yellow-100 px-2.5 py-0.5 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
