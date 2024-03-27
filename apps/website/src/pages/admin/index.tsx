import type { NextPage, NextPageContext } from "next";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.viewDashboard);
  if (!adminProps) {
    return {
      redirect: {
        destination: "/auth/signin",
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
