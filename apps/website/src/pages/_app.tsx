import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { SSRProvider } from "react-aria";
import { Analytics } from "@vercel/analytics/react";

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
  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <ConsentProvider>
          <Layout>
            <Component {...pageProps} />
            <Analytics />
          </Layout>
        </ConsentProvider>
      </SSRProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(AlveusGgWebsiteApp);
