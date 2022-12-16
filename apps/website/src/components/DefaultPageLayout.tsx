import React from "react";

type DefaultPageLayoutProps = {
  children?: React.ReactNode;
  title: string | JSX.Element;
};

const DefaultPageLayout: React.FC<DefaultPageLayoutProps> = ({
  children,
  title,
}) => {
  return (
    <div className="p-4">
      <header>
        <h1 className="my-3 font-serif text-3xl font-bold">{title}</h1>
      </header>
      <div>{children}</div>
    </div>
  );
};

export default DefaultPageLayout;
