import { classes } from "@/utils/classes";

import Link from "./Link";

const CustomLink = ({
  ...props
}: Omit<React.ComponentProps<typeof Link>, "custom">) => (
  <Link {...props} custom />
);

const getClassNames = (className?: string, dark = false, filled = false) =>
  classes(
    "rounded-3xl border-2 transition-colors",
    dark
      ? filled
        ? "hover:text-alveus-tan hover:border-alveus-tan hover:bg-transparent border-alveus-tan bg-alveus-tan text-alveus-green"
        : "text-alveus-tan border-alveus-tan bg-transparent hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
      : filled
        ? "hover:text-alveus-green hover:border-alveus-green hover:bg-transparent border-alveus-green bg-alveus-green text-alveus-tan dark:hover:text-alveus-tan dark:hover:border-alveus-tan dark:hover:bg-transparent dark:border-alveus-tan dark:bg-alveus-tan dark:text-alveus-green"
        : "text-alveus-green border-alveus-green bg-transparent hover:border-alveus-green hover:bg-alveus-green hover:text-alveus-tan dark:text-alveus-tan dark:border-alveus-tan dark:bg-transparent dark:hover:border-alveus-tan dark:hover:bg-alveus-tan dark:hover:text-alveus-green",
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
  <Element {...props} className={getClassNames(className, dark, filled)} />
);

export default Button;
