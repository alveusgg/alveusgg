import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { type Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type AppType } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { type ReactNode, useEffect } from "react";

import { unregisterServiceWorker } from "@/utils/sw";
import { trpc } from "@/utils/trpc";

import { ConsentProvider } from "@/hooks/consent";

import FontProvider from "@/components/layout/Fonts";
import Layout from "@/components/layout/Layout";

import "@/styles/tailwind.css";

unregisterServiceWorker();

const queryClient = new QueryClient();

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSession();

  // If we have an invalid session (such as a deleted Twitch account), sign out
  useEffect(() => {
    if (!data?.error) return;

    // Some accounts require additional auth scopes
    const additional = data.error.match(/^Additional scopes required: (.+)$/);
    if (additional?.[1]) {
      signIn(
        "twitch",
        { callbackUrl: window.location.href },
        {
          scope: additional[1],
        },
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
  const isAdminPopout =
    pathname.startsWith("/admin/") && pathname.match(/\/popout\/?$/) !== null;

  // Add stream class to the root for stream pages
  useEffect(() => {
    if (isStream) document.documentElement.classList.add("stream");
    else document.documentElement.classList.remove("stream");

    if (isAdminPopout) document.documentElement.classList.add("admin-popout");
    else document.documentElement.classList.remove("admin-popout");
  }, [isStream, isAdminPopout]);

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

  let content: ReactNode = (
    <ConsentProvider>
      <FontProvider>
        <Layout>
          <Component {...pageProps} />
          <Analytics />
        </Layout>
      </FontProvider>
    </ConsentProvider>
  );

  if (isAdminPopout) {
    content = (
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
    <ThemeProvider
      attribute={"class"}
      enableColorScheme
      enableSystem
      defaultTheme="system"
    >
      <SessionProvider session={session}>
        <SessionChecker>
          <QueryClientProvider client={queryClient}>
            {content}
          </QueryClientProvider>
        </SessionChecker>
      </SessionProvider>
    </ThemeProvider>
  );
};

export default trpc.withTRPC(AlveusGgWebsiteApp);
