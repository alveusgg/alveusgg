import React from "react";

type FieldsetProps = {
  legend: string;
  children: React.ReactNode;
};

export function Fieldset({ legend, children }: FieldsetProps) {
  return (
    <fieldset>
      <legend className="mb-2 font-bold">{legend}</legend>
      <div className="flex flex-col gap-2">{children}</div>
    </fieldset>
  );
}
