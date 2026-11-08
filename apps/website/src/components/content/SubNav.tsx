import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { useRouter } from "next/router";
import {
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { classes } from "@/utils/classes";

import IconChevronRight from "@/icons/IconChevronRight";
import IconMenu from "@/icons/IconMenu";

import Link from "./Link";

type SubNavLink = { name: string; href: string };

type SubNavProps = {
  links: SubNavLink[];
  className?: string;
  label?: string;
  children?: ReactNode;
};

// Phone menu: vertical list of links shown when the hamburger is open
const SubNavInner = ({
  links,
  className,
}: {
  links: SubNavLink[];
  className?: string;
}) => {
  const { asPath } = useRouter();

  return (
    <div className={classes("gap-2", className)}>
      {links.map(({ name, href }) => {
        const isActive = asPath === href;
        const isAnchorLink = href.startsWith("#");

        return (
          <Link
            key={name}
            href={href}
            custom
            className={classes(
              "flex items-center gap-1 rounded-full py-1 transition-colors",
              isActive
                ? "bg-alveus-green-800 text-white"
                : "hover:bg-alveus-green-200",
              isAnchorLink ? "px-2" : "px-4",
            )}
          >
            {isAnchorLink ? <IconChevronRight className="size-5" /> : null}
            {name}
          </Link>
        );
      })}
    </div>
  );
};

// Desktop bar: links separated by thin dividers, with the current section underlined
const SubNavBar = ({ links }: { links: SubNavLink[] }) => {
  const router = useRouter();
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<string>();

  // The current section is the last one whose heading has reached the spot a
  // link jump would scroll it to (its CSS scroll-margin-top, below the bar)
  const update = useCallback(() => {
    const sections = links
      .filter(({ href }) => href.startsWith("#"))
      .map(({ href }) => ({
        href,
        elm: document.getElementById(href.slice(1)),
      }))
      .filter(({ elm }) => elm && elm.offsetParent !== null);

    let current = sections[0]?.href;
    for (const { href, elm } of sections) {
      const { top } = elm!.getBoundingClientRect();
      const margin = parseFloat(getComputedStyle(elm!).scrollMarginTop);
      // Scrolling stops on whole pixels, so ignore any fraction left over
      if (Math.floor(top - margin) <= 0) current = href;
    }

    // Short final sections can never reach the top, so at the very bottom of
    // the page the last section is the current one
    const atBottom =
      Math.ceil(window.scrollY + window.innerHeight) >=
      document.documentElement.scrollHeight;
    if (atBottom && sections.length) current = sections.at(-1)!.href;

    setActive(current);
  }, [links]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  // If the links don't fit on one row, slide the bar so the current link is
  // in view. This sets the bar's own scrollLeft, as scrollIntoView can also
  // stop the page's smooth scroll in Firefox and Safari
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector("[aria-current]");
    if (!list || !link) return;

    const bar = list.getBoundingClientRect();
    const { left, right } = link.getBoundingClientRect();
    if (left < bar.left) list.scrollLeft += left - bar.left;
    else if (right > bar.right) list.scrollLeft += right - bar.right;
  }, [active]);

  return (
    <ul
      ref={listRef}
      className="-mx-3 scrollbar-none hidden min-w-0 grow items-center overflow-x-auto font-sans text-alveus-green-900 lg:flex"
    >
      {links.map(({ name, href }, idx) => {
        const isAnchorLink = href.startsWith("#");
        const isActive = isAnchorLink
          ? active === href
          : router.asPath === href;

        return (
          <Fragment key={name}>
            {idx > 0 && (
              <li
                aria-hidden="true"
                className="h-4 w-px shrink-0 bg-alveus-green-300"
              />
            )}
            <li className="shrink-0">
              <Link
                href={href}
                custom
                aria-current={
                  isActive ? (isAnchorLink ? "location" : "page") : undefined
                }
                className={classes(
                  "block border-b-3 px-3 pt-3 pb-2.5 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-alveus-green-700 motion-reduce:transition-none",
                  isActive
                    ? "border-alveus-green-700"
                    : "border-transparent hover:border-alveus-green-300",
                )}
              >
                {name}
              </Link>
            </li>
          </Fragment>
        );
      })}
    </ul>
  );
};

const SubNav = ({
  links,
  className,
  label = "On this page",
  children,
}: SubNavProps) => {
  return (
    <nav
      aria-label={label}
      className={classes(
        "sticky inset-x-0 top-0 bg-alveus-green-100/50 text-xl font-bold shadow-md backdrop-blur-2xl lg:border-b lg:border-alveus-green-200 lg:shadow-none",
        className,
      )}
    >
      <div
        className={classes(
          "container mx-auto px-2 py-1 lg:px-4 lg:py-0",
          children && "flex flex-wrap items-center gap-x-6",
        )}
      >
        <SubNavBar links={links} />

        {children && (
          <div className="flex min-w-0 grow flex-wrap items-center gap-x-4 gap-y-2 py-1 text-base font-normal lg:shrink-0 lg:grow-0 lg:py-2">
            {children}
          </div>
        )}

        <Disclosure
          as="div"
          className="flex flex-row items-start data-open:w-full lg:hidden"
        >
          <DisclosurePanel as={Fragment}>
            <SubNavInner links={links} className="flex flex-col" />
          </DisclosurePanel>

          <DisclosureButton className="ml-auto p-1.5">
            <IconMenu />
          </DisclosureButton>
        </Disclosure>
      </div>
    </nav>
  );
};

export default SubNav;
