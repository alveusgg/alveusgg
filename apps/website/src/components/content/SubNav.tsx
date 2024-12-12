import IconChevronRight from "@/icons/IconChevronRight";
import { classes } from "@/utils/classes";
import Link from "./Link";

type SubNavProps = {
  links: {
    name: string;
    href: string;
  }[];
  className?: string;
};

const SubNav = ({ links, className }: SubNavProps) => (
  <nav
    className={classes(
      "sticky inset-x-0 top-0 mt-0 bg-alveus-green-100/50 text-xl font-bold shadow-md backdrop-blur-2xl",
      className,
    )}
  >
    <div className="container mx-auto flex flex-row items-center gap-2 px-2 py-1">
      {links.map(({ name, href }) => (
        <Link
          key={name}
          href={href}
          custom
          className="flex items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-alveus-green-200"
        >
          <IconChevronRight className="size-5" />
          {name}
        </Link>
      ))}
    </div>
  </nav>
);

export default SubNav;
