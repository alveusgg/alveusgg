import { useEffect, type ReactNode } from "react";
import { PT_Sans, PT_Serif } from "next/font/google";
import Head from "next/head";
import Link from "next/link";

import { useRouter } from "next/router";
import Meta from "@/components/content/Meta";
import IconArrowRight from "@/icons/IconArrowRight";
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";

type LayoutProps = {
  children?: ReactNode;
};

const ptSans = PT_Sans({
  subsets: ["latin"],
  variable: "--font-ptsans",
  weight: ["400", "700"],
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  variable: "--font-ptserif",
  weight: ["400", "700"],
});

const fonts = `${ptSans.variable} ${ptSerif.variable} font-sans`;

const Layout = ({ children }: LayoutProps) => {
  // Add fonts to body for portals that do not attach to #app
  useEffect(() => {
    document.body.classList.add(...fonts.split(" "));
  }, []);

  const showTopHat = !useRouter().pathname.startsWith(
    "/events/fall-carnival-2023",
  );

  return (
    <>
      <Meta />

      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#636a60" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-title" content="Alveus Sanctuary" />
        <meta name="application-name" content="Alveus Sanctuary" />
        <meta name="msapplication-TileColor" content="#636a60" />
        <meta name="theme-color" content="#636a60" />
      </Head>

      <div
        id="app"
        className={`flex h-full min-h-[100vh] flex-col bg-alveus-tan text-alveus-green-900 ${fonts}`}
      >
        <a
          href="#main"
          className="sr-only left-0 top-0 z-40 w-auto rounded border-2 border-white bg-alveus-green-900 text-lg text-white focus:not-sr-only focus:fixed focus:m-4 focus:block focus:px-6 focus:py-4"
        >
          Jump to page content
        </a>
        <a
          href="#main-nav"
          className="sr-only left-0 top-0 z-40 w-auto rounded border-2 border-white bg-alveus-green-900 text-lg text-white focus:not-sr-only focus:fixed focus:m-4 focus:block focus:px-6 focus:py-4"
        >
          Jump to main navigation
        </a>

        {showTopHat && (
          <Link
            href="/events/fall-carnival-2023"
            className="relative z-10 block border-b border-b-[#28122f] bg-[#4E1362] px-4 pb-1 pt-1.5 text-sm text-white"
          >
            <div className="container mx-auto flex items-center justify-center gap-1">
              Alveus Fall Carnival &middot; Nov. 4th &middot; Get your ticket
              <IconArrowRight className="h-4 w-4" />
            </div>
          </Link>
        )}

        <Navbar />
        <main tabIndex={-1} id="main" className="flex flex-grow flex-col">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
