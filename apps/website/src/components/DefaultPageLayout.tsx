import { type ReactNode, type JSX } from "react";
import Heading from "./content/Heading";

export type DefaultPageLayoutProps = {
  children?: ReactNode;
  title: string | JSX.Element;
};

const DefaultPageLayout = ({ children, title }: DefaultPageLayoutProps) => {
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
