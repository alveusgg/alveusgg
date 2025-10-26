import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { getEntityStatus } from "@/utils/entity-helpers";
import { trpc } from "@/utils/trpc";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { AdminShowAndTellPreviewModal } from "@/components/admin/show-and-tell/AdminShowAndTellPreviewModal";
import DateTime from "@/components/content/DateTime";
import Meta from "@/components/content/Meta";
import { MessageBox } from "@/components/shared/MessageBox";
import {
  Button,
  approveButtonClasses,
  dangerButtonClasses,
  defaultButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";
import { ShowAndTellEntryForm } from "@/components/show-and-tell/ShowAndTellEntryForm";

import IconCheckCircle from "@/icons/IconCheckCircle";
import IconEye from "@/icons/IconEye";
import IconMinus from "@/icons/IconMinus";
import IconTrash from "@/icons/IconTrash";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const adminProps = await getAdminSSP(context, permissions.manageShowAndTell);
  if (!adminProps) {
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/show-and-tell",
        permanent: false,
      },
    };
  }

  return { props: adminProps };
}

const AdminReviewShowAndTellPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  const router = useRouter();
  const { entryId } = router.query;
  const getEntry = trpc.adminShowAndTell.getEntry.useQuery(String(entryId), {
    enabled: !!entryId,
  });

  const { data: postsFromANewLocation } =
    trpc.showAndTell.getPostsFromANewLocation.useQuery();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const deleteMutation = trpc.adminShowAndTell.delete.useMutation({
    onSettled: async () => {
      await getEntry.refetch();
    },
  });
  const approveMutation = trpc.adminShowAndTell.approve.useMutation({
    onSettled: async () => {
      await getEntry.refetch();
    },
  });
  const removeApprovalMutation =
    trpc.adminShowAndTell.removeApproval.useMutation({
      onSettled: async () => {
        await getEntry.refetch();
      },
    });

  const entry = getEntry.data;
  const status = entry && getEntityStatus(entry);

  return (
    <>
      <Meta title="Review submission - Admin Show and Tell" />

      <AdminPageLayout title="Show and Tell" menuItems={menuItems}>
        <Headline>Submission</Headline>

        <Panel>
          {getEntry.isPending && <p>Loading...</p>}
          {getEntry.isError && (
            <MessageBox variant="failure">{getEntry.error.message}</MessageBox>
          )}
          {entry && (
            <div className="flex flex-row">
              <div className="flex-1">
                Status:{" "}
                {status &&
                  {
                    pendingApproval: "Pending approval",
                    approved: "Approved",
                    deleted: "Deleted",
                  }[status]}
                <br />
                Author:{" "}
                {entry.user ? (
                  <>
                    {entry.user?.name} ({entry.user?.email})
                  </>
                ) : (
                  <em>Anonymous</em>
                )}
                <br />
                Submitted:{" "}
                <DateTime date={entry.createdAt} format={{ time: "minutes" }} />
                <br />
                Last updated:{" "}
                <DateTime date={entry.updatedAt} format={{ time: "minutes" }} />
                <br />
                {entry.approvedAt && (
                  <>
                    Approved at:{" "}
                    <DateTime
                      date={entry.approvedAt}
                      format={{ time: "minutes" }}
                    />
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="small"
                  className={secondaryButtonClasses}
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <IconEye className="size-4" />
                  Preview
                </Button>
                {status === "approved" && (
                  <Button
                    size="small"
                    className={defaultButtonClasses}
                    confirmationMessage="Please confirm removing the approval!"
                    onClick={() => removeApprovalMutation.mutate(entry.id)}
                  >
                    <IconMinus className="size-4" />
                    Remove approval
                  </Button>
                )}
                {status === "pendingApproval" && (
                  <Button
                    size="small"
                    className={approveButtonClasses}
                    onClick={() => approveMutation.mutate(entry.id)}
                  >
                    <IconCheckCircle className="size-4" />
                    Approve
                  </Button>
                )}
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm deletion!"
                  onClick={() => deleteMutation.mutate(entry.id)}
                >
                  <IconTrash className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </Panel>

        {entry && (
          <>
            <Headline>Review or edit post:</Headline>
            <Panel lightMode>
              <ShowAndTellEntryForm
                action="review"
                entry={entry}
                onUpdate={() => getEntry.refetch()}
              />
            </Panel>
          </>
        )}

        {entry && postsFromANewLocation && (
          <AdminShowAndTellPreviewModal
            entry={entry}
            newLocation={postsFromANewLocation.has(entry.id)}
            isOpen={isPreviewOpen}
            closeModal={() => setIsPreviewOpen(false)}
          />
        )}
      </AdminPageLayout>
    </>
  );
};

export default AdminReviewShowAndTellPage;
