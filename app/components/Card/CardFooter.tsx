import { ComponentPropsWithRef, forwardRef } from 'react';

type Props = ComponentPropsWithRef<'div'> & {
  as?: React.ElementType;
};

export default forwardRef<'div', Props>(function CardFooter(
  { as = 'div', children, ...props },
  ref,
) {
  const Component = as;

  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
});
