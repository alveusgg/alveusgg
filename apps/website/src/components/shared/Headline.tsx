export const Headline: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <h2 className="mb-3 mt-7 font-serif text-xl font-bold">{children}</h2>;
};
