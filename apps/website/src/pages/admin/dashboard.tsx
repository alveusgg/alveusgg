import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { DashboardOverviewStats } from "@/components/admin/dashboard/DashboardOverviewStats";
import { DashboardRecentActivity } from "@/components/admin/dashboard/DashboardRecentActivity";
import { DashboardSystemHealth } from "@/components/admin/dashboard/DashboardSystemHealth";
import { DashboardTopContributors } from "@/components/admin/dashboard/DashboardTopContributors";
import { DashboardTrendCharts } from "@/components/admin/dashboard/DashboardTrendCharts";
import Meta from "@/components/content/Meta";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.viewDashboard);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id ? "/unauthorized" : "/auth/signin",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminDashboardPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  return (
    <>
      <Meta title="Admin Dashboard" />

      <AdminPageLayout title="Dashboard" menuItems={menuItems}>
        <div className="space-y-6">
          {/* System Health Status */}
          <section>
            <DashboardSystemHealth />
          </section>

          {/* Overview Statistics */}
          <section>
            <Headline>Overview</Headline>
            <DashboardOverviewStats />
          </section>

          {/* Trend Charts */}
          <section>
            <DashboardTrendCharts />
          </section>

          {/* Recent Activity */}
          <section>
            <Headline>Recent Activity</Headline>
            <DashboardRecentActivity />
          </section>

          {/* Top Contributors - Shows top 5 Show & Tell contributors with rankings */}
          <section>
            <Headline>Community Highlights</Headline>
            <DashboardTopContributors />
          </section>
        </div>
      </AdminPageLayout>
    </>
  );
};
export default AdminDashboardPage;
