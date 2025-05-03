import { type ReactNode, type SelectHTMLAttributes } from "react";
import { type AriaFieldProps, useField } from "react-aria";

import { classes } from "@/utils/classes";

type SelectBoxFieldProps = SelectHTMLAttributes<HTMLSelectElement> &
  AriaFieldProps & {
    children?: ReactNode;
    label: string;
    className?: string;
  };

export function SelectBoxField(props: SelectBoxFieldProps) {
  const { labelProps, fieldProps } = useField(props);

  return (
    <div className={classes("flex-1", props.className)}>
      <label {...labelProps}>{props.label}</label>
      <br />
      <select
        className="w-full rounded-xs border border-gray-700 bg-white p-1 text-black"
        {...fieldProps}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        defaultValue={props.defaultValue}
        size={props.size}
      >
        {props.children}
      </select>
    </div>
  );
}
