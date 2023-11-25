import { ComponentPropsWithoutRef, ElementType, forwardRef } from 'react';

type Props = ComponentPropsWithoutRef<'div'> & {
  as?: React.ElementType;
  chidren?: React.ReactNode;
};

export default forwardRef<'div', Props>(function CardFooter(
  { as: Component = 'div', children, ...props },
  ref,
) {
  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
});
