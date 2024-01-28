import type { ComponentPropsWithoutRef } from "react";

type ImageProps = ComponentPropsWithoutRef<"img">;

export function Image({ style, alt, ...props }: ImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      style={{
        display: "block",
        outline: "none",
        border: "none",
        textDecoration: "none",
        ...style,
      }}
      alt={alt}
      {...props}
    />
  );
}
