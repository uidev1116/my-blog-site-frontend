import { forwardRef } from 'react';

type Props = React.ComponentPropsWithoutRef<'div'> & {
  children: React.ReactNode;
};

export default forwardRef<HTMLDivElement, Props>(function Tabs(
  { className = 'flex flex-col gap-10', children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
});
