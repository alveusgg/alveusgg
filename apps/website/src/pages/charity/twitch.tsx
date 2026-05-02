import type { GetServerSidePropsContext, NextPage } from "next";
import { getSession } from "next-auth/react";

import { trpc } from "@/utils/trpc";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import LoginWithExtraScopes from "@/components/shared/LoginWithExtraScopes";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { Button } from "@/components/shared/form/Button";

import IconInformationCircle from "@/icons/IconInformationCircle";
import IconXCircle from "@/icons/IconXCircle";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session?.user?.id) {
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${encodeURIComponent(
          context.resolvedUrl,
        )}`,
        permanent: false,
      },
    };
  }

  return { props: {} };
}

const TwitchCharityPage: NextPage = () => {
  const status = trpc.twitchCharity.getStatus.useQuery();
  const connect = trpc.twitchCharity.connectActiveCampaign.useMutation({
    onSuccess: () => status.refetch(),
  });

  const data = status.data;

  return (
    <>
      <Meta title="Twitch Charity" />

      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section className="grow">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-alveus-green/20 bg-alveus-tan/60 p-8 shadow-lg backdrop-blur-sm">
            <Heading className="my-0 text-center text-3xl">
              Connect Twitch Charity
            </Heading>

            <p className="mt-4 text-center text-base text-alveus-green-900">
              Link your active Twitch charity campaign so incoming donations can
              be matched to Alveus automatically.
            </p>

            <div className="mt-6 rounded-md bg-alveus-green-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <IconInformationCircle
                    className="size-5 text-alveus-green"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 text-sm text-alveus-green-900">
                  <p>
                    Start your campaign on Twitch first, then finish the
                    connection here.
                  </p>
                </div>
              </div>
            </div>

            {status.isLoading ? (
              <p className="mt-6 text-center text-sm text-alveus-green-900">
                Loading Twitch charity status...
              </p>
            ) : null}

            {data?.status === "missing_account" ? (
              <div className="mt-6 flex flex-col gap-3">
                <p className="text-center text-sm text-alveus-green-900">
                  Sign in with Twitch before connecting your campaign.
                </p>
                <LoginWithTwitchButton callbackUrl="/charity/twitch" />
              </div>
            ) : null}

            {data?.status === "missing_scope" ? (
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-center text-sm text-alveus-green-900">
                  Twitch needs one extra permission before we can read your
                  active charity campaign.
                </p>
                <LoginWithExtraScopes scopeGroup="charity" />
              </div>
            ) : null}

            {data?.status === "ready_to_connect" ? (
              <div className="mt-6 flex flex-col gap-3">
                <p className="text-center text-sm text-alveus-green-900">
                  Your Twitch login is ready. Connect the active campaign when
                  you&apos;re set.
                </p>
                <Button
                  disabled={connect.isPending}
                  onClick={() => connect.mutate()}
                >
                  Connect active campaign
                </Button>
              </div>
            ) : null}

            {data?.status === "connected" ? (
              <div className="mt-6 flex flex-col gap-4">
                <div className="rounded-md bg-alveus-green-50 p-4 text-sm text-alveus-green-900">
                  <p className="font-semibold">Campaign history connected</p>
                  <p>
                    Broadcaster ID: <code>{data.broadcasterUserId}</code>
                  </p>
                  <p className="mt-2">
                    Stored campaigns: {data.campaigns.length}
                  </p>
                  {data.campaigns.map((campaign) => (
                    <p key={campaign.id}>
                      Campaign ID: <code>{campaign.id}</code>
                    </p>
                  ))}
                </div>

                <Button
                  disabled={connect.isPending}
                  onClick={() => connect.mutate()}
                >
                  Refresh connected campaign
                </Button>
              </div>
            ) : null}

            {connect.error ? (
              <div className="mt-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <IconXCircle
                      className="size-5 text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 text-sm text-red-700">
                    <pre className="font-sans whitespace-pre-wrap">
                      {connect.error.message}
                    </pre>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Section>
    </>
  );
};

export default TwitchCharityPage;
