import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import Layout from "@/components/layout/Layout";
import { unregisterServiceWorker } from "@/utils/sw";
import { trpc } from "@/utils/trpc";

import { ConsentProvider } from "@/hooks/consent";
import "@/styles/globals.css";

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
