import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
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
      <ConsentProvider>
        <Layout>
          <Component {...pageProps} />
          <Analytics />
        </Layout>
      </ConsentProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(AlveusGgWebsiteApp);
