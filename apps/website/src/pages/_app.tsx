import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { SSRProvider } from "react-aria";
import smoothscroll from "smoothscroll-polyfill";

import { trpc } from "@/utils/trpc";
import "@/styles/globals.css";
import Layout from "@/components/layout/Layout";
import { unregisterServiceWorker } from "@/utils/sw";
import { ConsentProvider } from "@/hooks/consent";

unregisterServiceWorker();

const AlveusGgWebsiteApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useEffect(() => {
    if (!window) return;
    smoothscroll.polyfill();
  }, []);

  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <ConsentProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ConsentProvider>
      </SSRProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(AlveusGgWebsiteApp);
