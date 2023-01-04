import React from "react";

export const DefinitionItem: React.FC<{
  term: string | JSX.Element;
  children: React.ReactNode;
}> = ({ term, children }) => (
  <div className="flex justify-between py-3 text-sm font-medium">
    <dt className="text-gray-500">{term}</dt>
    <dd className="text-gray-900">{children}</dd>
  </div>
);
