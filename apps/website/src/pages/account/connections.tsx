import type { GetServerSidePropsContext, NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

import { getServerAuthSession } from "@/server/common/get-server-auth-session";

import {
  ACCOUNT_SETTINGS_PATH,
  type LoginProvider,
  loginProviders,
} from "@/data/auth";

import { trpc } from "@/utils/trpc";

import Box from "@/components/content/Box";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { MessageBox } from "@/components/shared/MessageBox";
import { Button, dangerButtonClasses } from "@/components/shared/form/Button";
import { TextField } from "@/components/shared/form/TextField";

import type { IconProps } from "@/icons/BaseIcon";
import IconCheck from "@/icons/IconCheck";
import IconLoading from "@/icons/IconLoading";
import IconTwitch from "@/icons/IconTwitch";

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

// Same branding as the sign-in buttons
const providerButtonClasses = {
  twitch: "bg-twitch text-white",
} satisfies Record<LoginProvider, string>;

const ProviderIcon = ({
  provider,
  ...props
}: IconProps & { provider: LoginProvider }) => {
  switch (provider) {
    case "twitch":
      return <IconTwitch {...props} />;
  }
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
    (typeof query.error === "string" ? linkErrors[query.error] : undefined);
  const unconnectedProviders =
    data?.providers.filter(
      (provider) =>
        !data.accounts.some((account) => account.provider === provider),
    ) ?? [];

  return (
    <>
      <Meta
        title="Account settings"
        description="Manage the logins connected to your Alveus Sanctuary account and the name shown for it."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark>
        <header>
          <Heading>Account settings</Heading>
        </header>

        <p className="text-lg">
          Manage the logins connected to your Alveus Sanctuary account and the
          name shown for it. Connected logins share your posts, entries, and
          permissions.
        </p>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow" containerClassName="max-w-2xl">
        {error && (
          <MessageBox variant="failure" className="mb-6">
            <p role="alert">{error}</p>
          </MessageBox>
        )}

        {connections.isPending && (
          <MessageBox className="flex flex-row items-center gap-4">
            <IconLoading />
            Loading connected accounts…
          </MessageBox>
        )}

        {connections.error && (
          <MessageBox variant="failure">
            <p role="alert">{connections.error.message}</p>
          </MessageBox>
        )}

        {data && (
          <>
            <Heading level={2} className="mt-0 mb-4">
              Connected accounts
            </Heading>

            {data.recentlyAuthenticated ? (
              <p className="mb-4 flex items-center gap-2">
                <IconCheck className="size-6 shrink-0" />
                <span>
                  Your identity has been confirmed. You can change your account
                  for a short while.
                </span>
              </p>
            ) : (
              <MessageBox className="mb-4">
                <p className="font-semibold">Confirm your identity first</p>
                <p>
                  Sign in again with one of your connected logins below before
                  making account changes.
                </p>
              </MessageBox>
            )}

            <ul className="flex flex-col gap-4">
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
                const hint = account.protected
                  ? "This account is used by an integration. Ask an administrator to disconnect it."
                  : lastLogin
                    ? "Connect another login method before disconnecting this one."
                    : undefined;

                return (
                  <li key={account.id}>
                    <Box className="bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {provider && (
                            <ProviderIcon
                              provider={provider}
                              className="size-6 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <div>
                            <strong className="text-lg">
                              {provider
                                ? loginProviders[provider]
                                : account.provider}
                            </strong>
                            <p className="text-sm wrap-anywhere">
                              Account ID: {account.providerAccountId}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {provider && (
                            <Button
                              width="auto"
                              size="small"
                              className={providerButtonClasses[provider]}
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
                              <ProviderIcon
                                provider={provider}
                                size={20}
                                aria-hidden="true"
                              />
                              <span>
                                Confirm with {loginProviders[provider]}
                              </span>
                            </Button>
                          )}

                          <Button
                            width="auto"
                            size="small"
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
                      </div>

                      {hint && <p className="mt-3 text-sm">{hint}</p>}
                    </Box>
                  </li>
                );
              })}
            </ul>

            {unconnectedProviders.length > 0 && (
              <>
                <Heading level={2} className="mt-8 mb-4">
                  Connect another login
                </Heading>

                <div className="flex flex-wrap gap-3">
                  {unconnectedProviders.map((provider) => (
                    <Button
                      key={provider}
                      width="auto"
                      className={providerButtonClasses[provider]}
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
                      <ProviderIcon
                        provider={provider}
                        size={20}
                        aria-hidden="true"
                      />
                      <span>Connect {loginProviders[provider]}</span>
                    </Button>
                  ))}
                </div>
              </>
            )}

            <Heading level={2} className="mt-8 mb-4">
              Display name
            </Heading>

            <p className="mb-4">
              Choose the name shown for your Alveus account. Signing in through
              another provider will keep this name.
            </p>

            {updateName.error && (
              <MessageBox variant="failure" className="mb-4">
                <p role="alert">{updateName.error.message}</p>
              </MessageBox>
            )}

            {updateName.isSuccess && (
              <MessageBox variant="success" className="mb-4">
                <p role="status">Display name saved.</p>
              </MessageBox>
            )}

            <Box className="bg-white p-4">
              <form
                className="flex flex-col items-start gap-4"
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
                  isDisabled={!data.recentlyAuthenticated}
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
                  {updateName.isPending ? (
                    <>
                      <IconLoading />
                      Saving…
                    </>
                  ) : (
                    "Save display name"
                  )}
                </Button>
              </form>
            </Box>
          </>
        )}
      </Section>
    </>
  );
};

export default AccountConnectionsPage;
