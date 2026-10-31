import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { useRouter } from "next/router";
import {
  Fragment,
  type MouseEvent,
  type RefObject,
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
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
const SubNavBar = ({
  links,
  navRef,
}: {
  links: SubNavLink[];
  navRef: RefObject<HTMLElement | null>;
}) => {
  const router = useRouter();
  const listRef = useRef<HTMLUListElement>(null);
  const lockRef = useRef(0);
  const [active, setActive] = useState<string>();

  // Work out which section is currently at the top of the viewport
  const update = useCallback(() => {
    if (Date.now() < lockRef.current) return;

    const offset = (navRef.current?.offsetHeight ?? 0) + 32;
    const visible = links.filter(({ href }) => {
      if (!href.startsWith("#")) return false;
      const elm = document.getElementById(href.slice(1));
      return elm && elm.offsetParent !== null;
    });

    let current = visible[0]?.href;
    for (const { href } of visible) {
      const elm = document.getElementById(href.slice(1));
      if (elm && elm.getBoundingClientRect().top - offset <= 0) current = href;
    }

    // At the very bottom of the page, the last section is the current one
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom && visible.length) current = visible[visible.length - 1]!.href;

    setActive(current);
  }, [links, navRef]);

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

  // Keep the current link visible if the bar scrolls sideways
  useEffect(() => {
    const list = listRef.current;
    const link = [...(list?.querySelectorAll("a") ?? [])].find(
      (a) => a.getAttribute("href") === active,
    );
    if (!list || !link) return;

    const start = link.offsetLeft - list.offsetLeft;
    const end = start + link.offsetWidth;
    if (start < list.scrollLeft || end > list.scrollLeft + list.clientWidth) {
      list.scrollTo({
        left: start - 16,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  }, [active]);

  const jump = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      const elm = document.getElementById(href.slice(1));
      if (!elm) return;
      e.preventDefault();

      const offset = (navRef.current?.offsetHeight ?? 0) + 16;
      const reduce = prefersReducedMotion();
      lockRef.current = Date.now() + (reduce ? 0 : 900);
      setActive(href);

      window.scrollTo({
        top: elm.getBoundingClientRect().top + window.scrollY - offset,
        behavior: reduce ? "auto" : "smooth",
      });

      // Update the URL without going through the router, as a router update
      // makes Next.js jump to the hash and cut the smooth scroll short
      window.history.replaceState(null, "", href);

      // Move focus to the section for keyboard and screen reader users
      if (!elm.hasAttribute("tabindex")) elm.setAttribute("tabindex", "-1");
      elm.focus({ preventScroll: true });
    },
    [navRef],
  );

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
                onClick={isAnchorLink ? (e) => jump(e, href) : undefined}
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

const SubNav = ({ links, className, label = "On this page" }: SubNavProps) => {
  const navRef = useRef<HTMLElement>(null);

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className={classes(
        "sticky inset-x-0 top-0 bg-alveus-green-100/50 text-xl font-bold shadow-md backdrop-blur-2xl lg:border-b lg:border-alveus-green-200 lg:shadow-none",
        className,
      )}
    >
      <div className="container mx-auto px-2 py-1 lg:px-4 lg:py-0">
        <SubNavBar links={links} navRef={navRef} />

        <Disclosure as="div" className="flex flex-row items-start lg:hidden">
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
