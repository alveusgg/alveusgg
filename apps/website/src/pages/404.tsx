import { type NextPage } from "next";
import Head from "next/head";

import DefaultPageLayout from "../components/DefaultPageLayout";

const NotFound: NextPage = () => {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="404 - Page Not Found"></DefaultPageLayout>
    </>
  );
};

export default NotFound;
