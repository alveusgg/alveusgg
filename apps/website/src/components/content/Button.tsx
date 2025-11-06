import { classes } from "@/utils/classes";

import Link from "./Link";

const CustomLink = ({
  ...props
}: Omit<React.ComponentProps<typeof Link>, "custom">) => (
  <Link {...props} custom />
);

const buttonClassNames = ({
  className,
  dark = false,
  filled = false,
}: {
  className?: string;
  dark?: boolean;
  filled?: boolean;
}) =>
  classes(
    "rounded-3xl border-2 transition-colors",
    dark
      ? filled
        ? "border-alveus-tan bg-alveus-tan text-alveus-green hover:border-alveus-tan hover:bg-transparent hover:text-alveus-tan"
        : "border-alveus-tan bg-transparent text-alveus-tan hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green dark:bg-gray-900 dark:text-alveus-tan"
      : filled
        ? "border-alveus-green bg-alveus-green text-alveus-tan hover:border-alveus-green hover:bg-transparent hover:text-alveus-green"
        : "border-alveus-green bg-transparent text-alveus-green hover:border-alveus-green hover:bg-alveus-green hover:text-alveus-tan dark:bg-gray-900 dark:text-alveus-tan",
    !/(^|\s)text-(xs|sm|base|lg|[2-6]?xl)(\s|$)/.test(className || "") &&
      "text-lg",
    !/(^|\s)((inline-)?(block|flex|grid|table)|inline|contents)(\s|$)/.test(
      className || "",
    ) && "inline-block",
    !/(^|\s)px?-\d+(\s|$)/.test(className || "") && "px-4",
    !/(^|\s)py?-\d+(\s|$)/.test(className || "") && "py-2",
    className,
  );

type ButtonProps<T extends React.ElementType> = React.ComponentProps<T> & {
  as?: T;
  dark?: boolean;
  filled?: boolean;
  className?: string;
};

const Button = <T extends React.ElementType>({
  as: Element = CustomLink,
  dark = false,
  filled = false,
  className,
  ...props
}: ButtonProps<T>) => (
  <Element
    {...props}
    className={buttonClassNames({ className, dark, filled })}
  />
);

export default Button;
