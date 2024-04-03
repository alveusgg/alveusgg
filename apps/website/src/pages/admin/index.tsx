import type { NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.viewDashboard);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id ? "/admin/unauthorized" : "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/admin/dashboard",
      permanent: false,
    },
  };
}

const AdminIndexPage: NextPage = () => {
  return null;
};
export default AdminIndexPage;
