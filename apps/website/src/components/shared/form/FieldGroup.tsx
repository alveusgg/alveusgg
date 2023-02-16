import React from "react";

type FieldGroupProps = {
  children: React.ReactNode;
};

export function FieldGroup({ children }: FieldGroupProps) {
  return <div className="flex flex-col gap-5 md:flex-row">{children}</div>;
}
