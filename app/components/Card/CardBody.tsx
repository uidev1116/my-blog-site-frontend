import { ComponentPropsWithRef, ElementType, forwardRef } from 'react';

type Props<T extends ElementType> = ComponentPropsWithRef<T> & {
  as?: T;
};

export default forwardRef<ElementType, Props<ElementType>>(function CardBody(
  { as: Component = 'div', children, ...props },
  ref,
) {
  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
});
