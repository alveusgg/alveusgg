import React from "react";

export function Panel({
  children,
}: {
  children?: React.ReactNode | React.ReactNode[];
}) {
  return (
    <div className="my-4 rounded-sm border bg-gray-50 p-4 text-gray-800 shadow-xl">
      {children}
    </div>
  );
}
