import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";

import Layout from "@/components/layout/Layout";
import { ConsentProvider } from "@/hooks/consent";
import "@/styles/globals.css";
import { unregisterServiceWorker } from "@/utils/sw";
import { trpc } from "@/utils/trpc";

unregisterServiceWorker();

const queryClient = new QueryClient();

const AlveusGgWebsiteApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ConsentProvider>
          <Layout>
            <Component {...pageProps} />
            <Analytics />
          </Layout>
        </ConsentProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(AlveusGgWebsiteApp);
