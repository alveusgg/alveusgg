import type { ComponentPropsWithoutRef } from "react";

export type LinkProps = ComponentPropsWithoutRef<"a">;

export function Link({ target = "_blank", style, ...props }: LinkProps) {
  return (
    <a
      {...props}
      style={{
        color: "#067df7",
        textDecoration: "none",
        ...style,
      }}
      target={target}
    >
      {props.children}
    </a>
  );
}
