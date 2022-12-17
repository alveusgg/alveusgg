import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import Image from "next/image";

import DinkDonk from "../../public/dinkdonk.gif";

import { getNotificationsConfig } from "../config/notifications";
import DefaultPageLayout from "../components/DefaultPageLayout";
import { Notifications } from "../components/Notifications";

export type NotificationConfig = {
  categories?: Array<{ tag: string; label: string }>;
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      notificationConfig: await getNotificationsConfig(),
    },
  };
};

const Updates: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  notificationConfig,
}) => {
  const session = useSession();

  return (
    <>
      <Head>
        <title>Updates | Alveus.gg</title>
      </Head>

      <DefaultPageLayout
        title={
          <span className="flex gap-4">
            Updates
            <Image
              className="-mt-4"
              src={DinkDonk}
              width={45}
              height={45}
              alt=""
            />
          </span>
        }
      >
        <p className="max-w-[400px] text-lg">
          Get notified when exciting Alveus stream content takes place, new
          videos are uploaded or the Alveus team has any other announcements to
          make!
        </p>

        {session.data?.user ? (
          <Notifications config={notificationConfig} />
        ) : (
          <p>Please sign in to subscribe to push notifications!</p>
        )}
      </DefaultPageLayout>
    </>
  );
};

export default Updates;
