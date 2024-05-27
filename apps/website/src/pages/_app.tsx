import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";
import "@/styles/globals.css";
import Layout from "@/components/layout/Layout";
import { unregisterServiceWorker } from "@/utils/sw";
import { ConsentProvider } from "@/hooks/consent";

unregisterServiceWorker();

const queryClient = new QueryClient();

const AlveusGgWebsiteApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const { pathname } = useRouter();
  const isStream = pathname.startsWith("/stream/");

  useEffect(() => {
    if (isStream) document.documentElement.classList.add("stream");
    else document.documentElement.classList.remove("stream");
  }, [isStream]);

  if (isStream) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>

        <Component {...pageProps} />
      </>
    );
  }

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
