import Head from "next/head";
import { useRouter } from "next/router";
import { type ReactNode, useMemo } from "react";

import globalPromotion from "@/data/env/global-promotion";

import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";

import IconArrowRight from "@/icons/IconArrowRight";

import { Footer } from "./footer/Footer";
import { Navbar } from "./navbar/Navbar";

type LayoutProps = {
  children?: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useRouter();
  const topHat = useMemo(
    () =>
      globalPromotion && !globalPromotion.excluded.includes(pathname)
        ? globalPromotion
        : null,
    [pathname],
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

        {topHat && (
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
        )}

        <Navbar />
        <main tabIndex={-1} id="main" className="flex grow flex-col">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
