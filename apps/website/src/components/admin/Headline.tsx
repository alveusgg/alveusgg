import React from "react";

export function Headline({ children }: { children: React.ReactNode }) {
  return <h2 className="my-3 text-lg font-bold">{children}</h2>;
}
