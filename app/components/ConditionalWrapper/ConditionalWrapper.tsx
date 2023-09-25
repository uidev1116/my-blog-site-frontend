type Props = {
  condition: boolean;
  wrapper: (children: React.ReactNode) => JSX.Element;
  children: React.ReactNode;
};

export default function ConditionalWrapper({
  condition,
  wrapper,
  children,
}: Props) {
  return <>{condition ? wrapper(children) : children}</>;
}
