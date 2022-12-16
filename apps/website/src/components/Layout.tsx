import React from "react";
import { PT_Sans, PT_Serif } from "@next/font/google";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import Head from "next/head";

type LayoutProps = {
  children?: React.ReactNode;
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

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`flex h-full min-h-[100vh] flex-col bg-alveus-tan ${ptSans.variable} ${ptSerif.variable} font-sans`}
      >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
