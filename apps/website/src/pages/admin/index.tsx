import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";

import { checkIsSuperUser } from "../../utils/auth";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (checkIsSuperUser(session)) {
    return {
      redirect: {
        destination: "/admin/dashboard",
        permanent: false,
      },
    };
  }

  return {
    notFound: true,
  };
};

const Admin: NextPage = () => {
  return null;
};
export default Admin;
