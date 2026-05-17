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
    "inline-block rounded-3xl border-2 px-4 py-2 text-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    dark
      ? filled
        ? "border-alveus-tan bg-alveus-tan text-alveus-green hover:not-disabled:border-alveus-tan hover:not-disabled:bg-transparent hover:not-disabled:text-alveus-tan"
        : "border-alveus-tan bg-transparent text-alveus-tan hover:not-disabled:border-alveus-tan hover:not-disabled:bg-alveus-tan hover:not-disabled:text-alveus-green"
      : filled
        ? "border-alveus-green bg-alveus-green text-alveus-tan hover:not-disabled:border-alveus-green hover:not-disabled:bg-transparent hover:not-disabled:text-alveus-green"
        : "border-alveus-green bg-transparent text-alveus-green hover:not-disabled:border-alveus-green hover:not-disabled:bg-alveus-green hover:not-disabled:text-alveus-tan",
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
