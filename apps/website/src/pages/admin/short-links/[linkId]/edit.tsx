import type {
  InferGetStaticPropsType,
  NextPage,
  GetServerSidePropsContext,
} from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { ShortLinkForm } from "@/components/admin/short-links/ShortLinkForm";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const adminProps = await getAdminSSP(context, permissions.manageShortLinks);
  if (!adminProps) {
    return { notFound: true };
  }

  const id = context.params?.linkId;
  if (!id) {
    return { notFound: true };
  }

  return {
    props: {
      ...adminProps,
      formId: String(id),
    },
  };
}

const AdminEditFormPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, formId }) => {
  const link = trpc.adminShortLinks.getLink.useQuery(formId);

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
