import { useEffect } from "react";
import { type AppType } from "next/app";
import { useRouter } from "next/router";
import Head from "next/head";
import { type Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";
import { unregisterServiceWorker } from "@/utils/sw";
import { botScopes, defaultScopes } from "@/data/twitch";

import { ConsentProvider } from "@/hooks/consent";

import Layout from "@/components/layout/Layout";
import FontProvider from "@/components/layout/Fonts";

import "@/styles/globals.css";

unregisterServiceWorker();

const queryClient = new QueryClient();

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSession();

  // If we have an invalid session (such as a deleted Twitch account), sign out
  useEffect(() => {
    if (!data?.error) return;

    // Some accounts require additional auth scopes
    if (data.error === "Additional scopes required") {
      signIn(
        "twitch",
        { callbackUrl: window.location.href },
        { scope: [...defaultScopes, ...botScopes].join(" ") },
      );
      return;
    }

    // Otherwise, just sign out
    signOut();
  }, [data?.error]);

  return children;
};

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
      <SessionChecker>
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
      </SessionChecker>
    </SessionProvider>
  );
};

export default trpc.withTRPC(AlveusGgWebsiteApp);
