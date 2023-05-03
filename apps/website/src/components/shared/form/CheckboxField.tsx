import React, { useRef, type ReactNode } from "react";
import { useCheckbox, type AriaCheckboxProps } from "react-aria";
import { useToggleState } from "react-stately";

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
      className={`flex flex-row items-start gap-3 ${props.className || ""}`}
    >
      <span className="block pt-0.5">
        <input {...inputProps} ref={ref} required={props.isRequired} />
      </span>
      <span>{props.children}</span>
    </label>
  );
}
