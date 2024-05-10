import type { ReactNode } from "react";

type FieldGroupProps = {
  children: ReactNode;
};

export function FieldGroup({ children }: FieldGroupProps) {
  return <div className="flex flex-col gap-5 md:flex-row">{children}</div>;
}
