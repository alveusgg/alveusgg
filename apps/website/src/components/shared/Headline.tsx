export const Headline: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <h2 className="mt-7 mb-3 font-serif text-xl font-bold">{children}</h2>;
};
