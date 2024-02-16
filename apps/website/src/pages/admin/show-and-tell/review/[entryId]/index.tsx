import type { NextPage, NextPageContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";

import { trpc } from "@/utils/trpc";
import { getEntityStatus } from "@/utils/entity-helpers";
import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/data/permissions";

import { MessageBox } from "@/components/shared/MessageBox";
import { ShowAndTellEntryForm } from "@/components/show-and-tell/ShowAndTellEntryForm";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import {
  approveButtonClasses,
  Button,
  dangerButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/Button";
import Meta from "@/components/content/Meta";
import DateTime from "@/components/content/DateTime";
import IconTrash from "@/icons/IconTrash";
import IconMinus from "@/icons/IconMinus";
import IconCheckCircle from "@/icons/IconCheckCircle";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.manageShowAndTell);
  return adminProps ? { props: adminProps } : { notFound: true };
}

const AdminReviewShowAndTellPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  const router = useRouter();
  const { entryId } = router.query;
  const getEntry = trpc.adminShowAndTell.getEntry.useQuery(String(entryId), {
    enabled: !!entryId,
  });

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
          {getEntry.isLoading && <p>Loading...</p>}
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
                {status === "approved" && (
                  <Button
                    size="small"
                    className={defaultButtonClasses}
                    confirmationMessage="Please confirm removing the approval!"
                    onClick={() => removeApprovalMutation.mutate(entry.id)}
                  >
                    <IconMinus className="h-4 w-4" />
                    Remove approval
                  </Button>
                )}
                {status === "pendingApproval" && (
                  <Button
                    size="small"
                    className={approveButtonClasses}
                    onClick={() => approveMutation.mutate(entry.id)}
                  >
                    <IconCheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                )}
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm deletion!"
                  onClick={() => deleteMutation.mutate(entry.id)}
                >
                  <IconTrash className="h-4 w-4" />
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
      </AdminPageLayout>
    </>
  );
};

export default AdminReviewShowAndTellPage;
