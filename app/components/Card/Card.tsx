import clsx from 'clsx';
import { ComponentPropsWithRef, ElementType, forwardRef } from 'react';

type Props<T extends ElementType> = ComponentPropsWithRef<T> & {
  as?: T;
};

export default forwardRef<ElementType, Props<ElementType>>(function Card(
  { as: Component = 'div', className, children, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={clsx(
        'flex h-full w-full flex-col gap-y-2 rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
