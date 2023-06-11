import React from "react";

import { classes } from "@/utils/classes";

type FieldsetProps = {
  className?: string;
  legend: string;
  legendClassName?: string;
  children: React.ReactNode;
};

export function Fieldset({
  className,
  legend,
  legendClassName = "",
  children,
}: FieldsetProps) {
  return (
    <fieldset className={className}>
      <legend className={classes("mb-2 font-bold", legendClassName)}>
        {legend}
      </legend>
      <div className="flex flex-col gap-2">{children}</div>
    </fieldset>
  );
}
