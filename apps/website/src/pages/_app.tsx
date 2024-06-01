import { useEffect } from "react";
import { type AppType } from "next/app";
import { useRouter } from "next/router";
import Head from "next/head";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";
import { unregisterServiceWorker } from "@/utils/sw";

import { ConsentProvider } from "@/hooks/consent";

import Layout from "@/components/layout/Layout";
import FontProvider from "@/components/layout/Fonts";

import "@/styles/globals.css";

unregisterServiceWorker();

const queryClient = new QueryClient();

const AlveusGgWebsiteApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const { pathname } = useRouter();
  const isStream = pathname.startsWith("/stream/");

  // Add stream class to the root for stream pages
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

        <FontProvider>
          <Component {...pageProps} />
        </FontProvider>
      </>
    );
  }

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ConsentProvider>
          <FontProvider>
            <Layout>
              <Component {...pageProps} />
              <Analytics />
            </Layout>
          </FontProvider>
        </ConsentProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(AlveusGgWebsiteApp);
