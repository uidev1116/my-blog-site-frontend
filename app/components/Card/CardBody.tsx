import { ComponentPropsWithoutRef, forwardRef } from 'react';

type Props = ComponentPropsWithoutRef<'div'> & {
  as?: React.ElementType;
};

export default forwardRef<'div', Props>(function CardBody(
  { as: Component = 'div', children, ...props },
  ref,
) {
  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
});
