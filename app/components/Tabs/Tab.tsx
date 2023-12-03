import { forwardRef } from 'react';

type Props = React.ComponentPropsWithoutRef<'li'> & {
  children: React.ReactNode;
};

export default forwardRef<HTMLLIElement, Props>(function Tab(
  { className = 'me-2', children, ...rest },
  ref,
) {
  return (
    <li ref={ref} className={className} {...rest}>
      {children}
    </li>
  );
});
