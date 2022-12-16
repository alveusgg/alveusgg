import React from "react";

type DefaultPageLayoutProps = {
  children?: React.ReactNode;
  title: string;
};

const DefaultPageLayout: React.FC<DefaultPageLayoutProps> = ({
  children,
  title,
}) => {
  return (
    <div className="p-4">
      <header>
        <h1 className="my-3 text-xl">{title}</h1>
      </header>
      <div>{children}</div>
    </div>
  );
};

export default DefaultPageLayout;
