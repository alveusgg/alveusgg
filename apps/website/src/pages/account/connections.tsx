import type { GetServerSidePropsContext, NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

import { getServerAuthSession } from "@/server/common/get-server-auth-session";

import { ACCOUNT_SETTINGS_PATH, loginProviders } from "@/data/auth";

import { trpc } from "@/utils/trpc";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import LoginProviderButton from "@/components/shared/LoginProviderButton";
import { Button, dangerButtonClasses } from "@/components/shared/form/Button";
import { TextField } from "@/components/shared/form/TextField";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);
  if (!session?.user)
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${ACCOUNT_SETTINGS_PATH}`,
        permanent: false,
      },
    };
  return { props: { session } };
}

const linkErrors: Record<string, string> = {
  "auth-failed":
    "Sign-in was cancelled or could not be completed. Your existing account connections have been kept.",
  "already-linked":
    "That login belongs to another Alveus account. Sign in to the original account to manage it.",
  "link-required":
    "The connection request expired or could not be verified. Confirm your identity and try again.",
};

const AccountConnectionsPage: NextPage = () => {
  const { data: session, update: updateSession } = useSession();
  const { query } = useRouter();
  const connections = trpc.auth.getAccountConnections.useQuery();
  const beginLink = trpc.auth.beginAccountLink.useMutation();
  const disconnect = trpc.auth.disconnectAccount.useMutation({
    onSuccess: async () => {
      await connections.refetch();
      await updateSession();
    },
  });
  const updateName = trpc.auth.updateDisplayName.useMutation({
    onSuccess: async () => {
      await updateSession();
    },
  });
  const [name, setName] = useState(session?.user?.name ?? "");
  const [redirecting, setRedirecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>();
  const data = connections.data;
  const busy = beginLink.isPending || disconnect.isPending || redirecting;
  const error =
    connectionError ??
    disconnect.error?.message ??
    updateName.error?.message ??
    (typeof query.error === "string" ? linkErrors[query.error] : undefined);

  return (
    <>
      <Meta
        title="Connected accounts"
        description="Manage the accounts you use to sign in to Alveus Sanctuary."
      />
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />
      <Section className="grow">
        <div className="mx-auto w-full max-w-2xl">
          <Heading level={1}>Your account</Heading>
          <p className="mb-6">
            Connected logins share your Alveus account, posts, entries, and
            permissions.
          </p>
          {error && (
            <p role="alert" className="my-4">
              {error}
            </p>
          )}
          {connections.isPending && <p>Loading connected accounts...</p>}
          {connections.error && <p role="alert">{connections.error.message}</p>}
          {data && (
            <>
              {!data.recentlyAuthenticated && (
                <p className="my-4">
                  Confirm your identity with a connected login below before
                  making account changes.
                </p>
              )}
              <Heading level={2}>Connected accounts</Heading>
              <ul className="divide-y divide-alveus-green/20">
                {data.accounts.map((account) => {
                  const provider = data.providers.find(
                    (provider) => provider === account.provider,
                  );
                  const lastLogin = !data.accounts.some(
                    (other) =>
                      other.id !== account.id &&
                      data.providers.some(
                        (provider) => provider === other.provider,
                      ),
                  );
                  return (
                    <li key={account.id} className="py-5">
                      <p className="font-semibold">
                        {provider ? loginProviders[provider] : account.provider}
                      </p>
                      <p className="my-2 text-sm wrap-anywhere">
                        Account ID: {account.providerAccountId}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {provider && (
                          <LoginProviderButton
                            provider={provider}
                            width="auto"
                            disabled={busy}
                            onClick={async () => {
                              setRedirecting(true);
                              try {
                                await signIn(provider, {
                                  callbackUrl: ACCOUNT_SETTINGS_PATH,
                                });
                              } catch {
                                setConnectionError(
                                  "Unable to start sign-in. Please try again.",
                                );
                                setRedirecting(false);
                              }
                            }}
                          >
                            Confirm with {loginProviders[provider]}
                          </LoginProviderButton>
                        )}
                        <Button
                          width="auto"
                          className={dangerButtonClasses}
                          disabled={
                            busy ||
                            account.protected ||
                            lastLogin ||
                            !data.recentlyAuthenticated
                          }
                          confirmationMessage="Disconnect this login and sign out your other website sessions?"
                          onClick={() => disconnect.mutate(account.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                      {account.protected && (
                        <p className="mt-2 text-sm">
                          This account is used by an integration. Ask an
                          administrator to disconnect it.
                        </p>
                      )}
                      {lastLogin && (
                        <p className="mt-2 text-sm">
                          Connect another login method before disconnecting this
                          one.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
              {data.providers.some(
                (provider) =>
                  !data.accounts.some(
                    (account) => account.provider === provider,
                  ),
              ) && (
                <>
                  <Heading level={2}>Connect another login</Heading>
                  <div className="my-4 flex flex-wrap gap-3">
                    {data.providers
                      .filter(
                        (provider) =>
                          !data.accounts.some(
                            (account) => account.provider === provider,
                          ),
                      )
                      .map((provider) => (
                        <LoginProviderButton
                          key={provider}
                          provider={provider}
                          width="auto"
                          disabled={busy || !data.recentlyAuthenticated}
                          onClick={async () => {
                            setConnectionError(undefined);
                            try {
                              await beginLink.mutateAsync({ provider });
                              setRedirecting(true);
                              await signIn(provider, {
                                callbackUrl: ACCOUNT_SETTINGS_PATH,
                              });
                            } catch (error) {
                              setConnectionError(
                                error instanceof Error
                                  ? error.message
                                  : "Unable to connect this account.",
                              );
                              setRedirecting(false);
                            }
                          }}
                        >
                          Connect {loginProviders[provider]}
                        </LoginProviderButton>
                      ))}
                  </div>
                </>
              )}
              <Heading level={2}>Display name</Heading>
              <p className="my-3">
                Choose the name shown for your Alveus account. Signing in
                through another provider will keep this name.
              </p>
              <form
                className="my-4 flex flex-col items-start gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateName.mutate(name);
                }}
              >
                <TextField
                  label="Display name"
                  value={name}
                  onChange={setName}
                  maxLength={100}
                />
                <Button
                  width="auto"
                  type="submit"
                  disabled={
                    !data.recentlyAuthenticated ||
                    !name.trim() ||
                    updateName.isPending
                  }
                >
                  Save display name
                </Button>
                {updateName.isSuccess && (
                  <p role="status">Display name saved.</p>
                )}
              </form>
            </>
          )}
        </div>
      </Section>
    </>
  );
};

export default AccountConnectionsPage;
