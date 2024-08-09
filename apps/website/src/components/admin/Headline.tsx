import type { ReactNode } from "react";

export function Headline({ children }: { children: ReactNode }) {
  return <h2 className="my-3 text-lg font-bold">{children}</h2>;
}
