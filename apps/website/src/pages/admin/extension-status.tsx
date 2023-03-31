import React from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import Meta from "@/components/content/Meta";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import { trpc } from "@/utils/trpc";
import { getTwitchConfig } from "@/config/twitch";
import { FieldGroup } from "@/components/shared/form/FieldGroup";
import { Button } from "@/components/shared/Button";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { MessageBox } from "@/components/shared/MessageBox";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(
    context,
    permissions.manageExtensionStatus
  );
  if (!adminProps) {
    return { notFound: true };
  }

  return {
    props: {
      ...adminProps,
      channelId: (await getTwitchConfig()).channels.maya.id,
    },
  };
}

const AdminGiveawaysPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, channelId }) => {
  const extension = "AlveusAmbassadors";

  const extensionStatus = trpc.adminExtensionStatus.getExtensionStatus.useQuery(
    {
      extension,
      channelId,
    }
  );
  const update = trpc.adminExtensionStatus.updateExtensionStatus.useMutation({
    onMutate: () => extensionStatus.refetch(),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const overlay = formData.get("overlay");
    if (overlay) {
      await update.mutateAsync({
        channelId,
        extension,
        data: { overlay: String(overlay) },
      });
    }
  };

  const overlayValue = extensionStatus.data?.overlay || undefined;

  return (
    <>
      <Meta title="Extension Status | Admin" />

      <AdminPageLayout title="Extension Status" menuItems={menuItems}>
        <form onSubmit={handleSubmit}>
          {update.isError && (
            <MessageBox variant="failure">
              {update.error?.message || "Unknown error"}
            </MessageBox>
          )}

          <Fieldset legend="Overlay options">
            <SelectBoxField
              label="Overlay"
              name="overlay"
              defaultValue={overlayValue}
              key={overlayValue}
              required
            >
              <option value="maya">Maya overlay</option>
              <option value="alveus">Alveus overlay</option>
            </SelectBoxField>

            <Button type="submit" disabled={update.isLoading}>
              {update.isLoading ? "Updating …" : "Update"}
            </Button>
          </Fieldset>
        </form>
      </AdminPageLayout>
    </>
  );
};
export default AdminGiveawaysPage;
