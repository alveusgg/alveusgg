export const Headline: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <h2 className="my-3 font-serif text-xl font-bold">{children}</h2>;
};
