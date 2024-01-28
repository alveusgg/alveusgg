import type { ComponentPropsWithoutRef } from "react";

type AllowedTag = (typeof allowedTags)[number];
const allowedTags = ["div", "p"] as const;
type TextProps<Tag extends AllowedTag> = ComponentPropsWithoutRef<Tag>;

export function Text<Tag extends AllowedTag = "div">({
  children,
  style,
  ...props
}: TextProps<Tag> & { as?: Tag }) {
  const T = props.as ?? "div";
  return (
    <T
      {...props}
      style={{
        fontSize: "14px",
        lineHeight: "24px",
        margin: "16px 0",
        ...style,
      }}
    >
      {children}
    </T>
  );
}
