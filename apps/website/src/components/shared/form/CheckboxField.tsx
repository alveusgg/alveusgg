import { type ReactNode, useRef } from "react";
import { type AriaCheckboxProps, useCheckbox } from "react-aria";
import { useToggleState } from "react-stately";

import { classes } from "@/utils/classes";

type CheckboxFieldProps = AriaCheckboxProps & {
  children: ReactNode | ReactNode[];
  className?: string;
};

export function CheckboxField(props: CheckboxFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const state = useToggleState(props);
  const { inputProps } = useCheckbox(props, state, ref);

  return (
    <label
      className={classes("flex flex-row items-start gap-3", props.className)}
    >
      <span className="block pt-0.5">
        <input {...inputProps} ref={ref} required={props.isRequired} />
      </span>
      <span>{props.children}</span>
    </label>
  );
}
