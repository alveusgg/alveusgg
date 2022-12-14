import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { PT_Sans, PT_Serif } from "@next/font/google";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";

const ptSans = PT_Sans({
  subsets: ["latin"],
  variable: "--font-ptsans",
  weight: "400",
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  variable: "--font-ptserif",
  weight: "400",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={`${ptSans.variable} ${ptSerif.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
