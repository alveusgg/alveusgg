import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";
import Script from "next/script";

import { env as serverEnv } from "@/env/server.mjs";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Panel } from "@/components/admin/Panel";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.viewStats);
  if (!adminProps) {
    return { notFound: true };
  }

  const statsBaseUrl = serverEnv.STATS_BASE_URL;

  return {
    props: {
      ...adminProps,
      statsEmbedUrl: serverEnv.STATS_EMBED_URL,
      statsHostScriptUrl: statsBaseUrl && `${statsBaseUrl}/js/embed.host.js`,
    },
  };
}

function StatsEmbed({
  statsEmbedUrl,
  statsHostScriptUrl,
}: {
  statsEmbedUrl: string;
  statsHostScriptUrl?: string;
}) {
  return (
    <>
      <iframe
        plausible-embed="true"
        src={statsEmbedUrl}
        loading="lazy"
        className="h-[1600px] w-full border-0"
      />
      {statsHostScriptUrl && <Script async src={statsHostScriptUrl} />}
    </>
  );
}

const AdminDashboardPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, statsEmbedUrl, statsHostScriptUrl }) => {
  return (
    <>
      <Meta title="Admin" />

      <AdminPageLayout title="Stats" menuItems={menuItems}>
        <Panel>
          {statsEmbedUrl ? (
            <StatsEmbed
              statsEmbedUrl={statsEmbedUrl}
              statsHostScriptUrl={statsHostScriptUrl}
            />
          ) : (
            <p>
              No website auth set. Set the environment variable STATS_EMBED_URL
              to enable the stats embed.
            </p>
          )}
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminDashboardPage;
