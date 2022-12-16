import { type NextPage } from "next";
import Head from "next/head";

import DefaultPageLayout from "../components/DefaultPageLayout";
import { Notifications } from "../components/Notifications";

const Updates: NextPage = () => {
  return (
    <>
      <Head>
        <title>Updates | Alveus.gg</title>
      </Head>

      <DefaultPageLayout title="Updates">
        <p>Lorem ipsum dolor sit amet</p>

        <Notifications />
      </DefaultPageLayout>
    </>
  );
};

export default Updates;
