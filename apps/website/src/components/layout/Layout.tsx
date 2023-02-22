import React from "react";
import { PT_Sans, PT_Serif } from "@next/font/google";
import Head from "next/head";

import { env } from "../../env/client.mjs";
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";

type LayoutProps = {
  children?: React.ReactNode;
};

export const ptSans = PT_Sans({
  subsets: ["latin"],
  variable: "--font-ptsans",
  weight: ["400", "700"],
});

export const ptSerif = PT_Serif({
  subsets: ["latin"],
  variable: "--font-ptserif",
  weight: ["400", "700"],
});

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
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
        <meta name="apple-mobile-web-app-title" content="Alveus.gg" />
        <meta name="application-name" content="Alveus.gg" />
        <meta name="msapplication-TileColor" content="#636a60" />
        <meta name="theme-color" content="#636a60" />

        {env.NEXT_PUBLIC_NODE_ENV === "production" &&
          env.NEXT_PUBLIC_COOKIEBOT_ID && (
            /* eslint-disable-next-line @next/next/no-sync-scripts */
            <script
              id="Cookiebot"
              src="https://consent.cookiebot.com/uc.js"
              data-cbid={env.NEXT_PUBLIC_COOKIEBOT_ID}
              data-blockingmode="auto"
            />
          )}
      </Head>

      <div
        className={`flex h-full min-h-[100vh] flex-col bg-alveus-tan text-alveus-green-900 ${ptSans.variable} ${ptSerif.variable} font-sans`}
      >
        <Navbar />
        <main className="z-10 flex flex-grow flex-col">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
