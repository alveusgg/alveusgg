import React from "react";
import Heading from "./content/Heading"

export type DefaultPageLayoutProps = {
  children?: React.ReactNode;
  title: string | JSX.Element;
};

const DefaultPageLayout: React.FC<DefaultPageLayoutProps> = ({
  children,
  title,
}) => {
  return (
    <div className="p-4">
      <header className="container mx-auto">
        <Heading className="my-3 text-3xl">{title}</Heading>
      </header>
      <div>{children}</div>
    </div>
  );
};

export default DefaultPageLayout;
