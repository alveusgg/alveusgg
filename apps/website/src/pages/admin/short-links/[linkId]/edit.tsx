import type {
  GetServerSidePropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { getSession } from "next-auth/react";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { ShortLinkForm } from "@/components/admin/short-links/ShortLinkForm";
import Meta from "@/components/content/Meta";
import { MessageBox } from "@/components/shared/MessageBox";
import { permissions } from "@/data/permissions";
import { getAdminSSP } from "@/server/utils/admin";
import { trpc } from "@/utils/trpc";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageShortLinks);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : `/auth/signin?callbackUrl=${encodeURIComponent(
              context.resolvedUrl,
            )}`,
        permanent: false,
      },
    };
  }

  const id = context.params?.linkId;
  if (!id) {
    return { notFound: true };
  }

  return {
    props: {
      ...adminProps,
      linkId: String(id),
    },
  };
}

const AdminEditFormPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, linkId }) => {
  const link = trpc.adminShortLinks.getShortLink.useQuery(linkId);

  return (
    <>
      <Meta title="Edit Short Link | Admin" />

      <AdminPageLayout title="Edit Short Link" menuItems={menuItems}>
        <Headline>Edit Short Link</Headline>

        <Panel>
          {link.data ? (
            <ShortLinkForm action="edit" shortLink={link.data} />
          ) : (
            <MessageBox>Loading …</MessageBox>
          )}
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminEditFormPage;
