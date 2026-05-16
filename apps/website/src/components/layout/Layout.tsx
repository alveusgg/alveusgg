import Head from "next/head";
import { useRouter } from "next/router";
import { type ReactNode, useMemo, useState } from "react";

import globalPromotion from "@/data/env/global-promotion";

import { classes } from "@/utils/classes";

import { useSiteHeader } from "@/hooks/use-site-header";

import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";

import IconArrowRight from "@/icons/IconArrowRight";

import { ScrollToTopButton } from "./ScrollToTopButton";
import { Footer } from "./footer/Footer";
import { Navbar } from "./navbar/Navbar";

type LayoutProps = {
  children?: ReactNode;
};

const HERO_PATHS = new Set(["/", "/institute"]);

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useRouter();
  const isAdminPage = pathname.startsWith("/admin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerShellNode, setHeaderShellNode] = useState<HTMLDivElement | null>(
    null,
  );

  const { headerVisible, headerHeight, scrolled } = useSiteHeader({
    enabled: !isAdminPage,
    mobileMenuOpen,
    headerElement: headerShellNode,
  });
  const isHeroPage = HERO_PATHS.has(pathname);
  const solidChrome = !isHeroPage || scrolled;

  const topHat = useMemo(
    () =>
      globalPromotion && !globalPromotion.excluded.includes(pathname)
        ? globalPromotion
        : null,
    [pathname],
  );

  const topHatSection = topHat ? (
    <Link
      href={topHat.link}
      external={topHat.external}
      className="relative z-10 block border-b border-b-carnival-800 bg-carnival px-4 py-1.5 text-sm text-white hover:underline"
      custom
    >
      <div className="container mx-auto flex items-center justify-center gap-1">
        {topHat.title} &middot; {topHat.cta}
        <IconArrowRight className="size-4" />
      </div>
    </Link>
  ) : null;

  const mainChrome = isAdminPage ? (
    <>
      {topHatSection}
      <Navbar />
    </>
  ) : (
    <>
      <div
        ref={setHeaderShellNode}
        className={classes(
          "fixed inset-x-0 top-0 z-50 duration-300 ease-in-out motion-reduce:duration-150 motion-reduce:ease-linear",
          isHeroPage
            ? "transition-[translate,box-shadow,background-color]"
            : "transition-[translate,box-shadow]",
          solidChrome ? "bg-alveus-green-900" : "bg-transparent",
          headerVisible
            ? classes("translate-y-0", solidChrome && "shadow-md")
            : "-translate-y-full shadow-none",
        )}
      >
        {topHatSection}
        <Navbar onMobileMenuOpenChange={setMobileMenuOpen} />
      </div>
      <div
        className={classes("shrink-0", !isHeroPage && "bg-alveus-green-900")}
        style={{ height: headerHeight }}
        aria-hidden
      />
    </>
  );

  return (
    <>
      <Meta />

      <Head>
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#636a60" />
        <meta name="msapplication-TileColor" content="#636a60" />
        <meta name="theme-color" content="#636a60" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="Alveus Sanctuary" />
        <meta name="application-name" content="Alveus Sanctuary" />
      </Head>

      <div
        id="app"
        className="flex h-full min-h-screen flex-col bg-alveus-tan text-alveus-green-900"
      >
        <a
          href="#main"
          className="sr-only top-0 left-0 z-40 w-auto rounded-sm border-2 border-white bg-alveus-green-900 text-lg text-white focus:not-sr-only focus:fixed focus:m-4 focus:block focus:px-6 focus:py-4"
        >
          Jump to page content
        </a>
        <a
          href="#main-nav"
          className="sr-only top-0 left-0 z-40 w-auto rounded-sm border-2 border-white bg-alveus-green-900 text-lg text-white focus:not-sr-only focus:fixed focus:m-4 focus:block focus:px-6 focus:py-4"
        >
          Jump to main navigation
        </a>

        {mainChrome}

        <main tabIndex={-1} id="main" className="flex grow flex-col">
          {children}
        </main>
        <Footer />

        {!isAdminPage ? <ScrollToTopButton /> : null}
      </div>
    </>
  );
};

export default Layout;
