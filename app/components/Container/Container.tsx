type Props = {
  children?: React.ReactNode;
};

export default function Container({ children }: Props) {
  return (
    <div className="px-4 py-8 lg:container lg:mx-auto lg:py-12">{children}</div>
  );
}
