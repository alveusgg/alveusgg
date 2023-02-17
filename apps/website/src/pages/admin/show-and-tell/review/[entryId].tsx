import React from "react";
import type { NextPage, NextPageContext, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  MinusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { trpc } from "@/utils/trpc";
import { getEntityStatus } from "@/utils/entity-helpers";
import { getAdminSSP } from "@/server/utils/admin";
import { MessageBox } from "@/components/shared/MessageBox";
import { ShowAndTellEntryForm } from "@/components/show-and-tell/ShowAndTellEntryForm";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { LocalTime } from "@/components/shared/LocalTime";
import {
  approveButtonClasses,
  Button,
  dangerButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/Button";
import { permissions } from "@/config/permissions";

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
  const restoreMutation = trpc.adminShowAndTell.restore.useMutation({
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
      <Head>
        <title>Review submission - Admin Show and Tell | Alveus.gg</title>
      </Head>

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
                Submitted: <LocalTime dateTime={entry.createdAt} />
                <br />
                Last updated: <LocalTime dateTime={entry.updatedAt} />
                <br />
                {entry.approvedAt && (
                  <>
                    Approved at: <LocalTime dateTime={entry.approvedAt} />
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
                    <MinusIcon className="h-4 w-4" />
                    Remove approval
                  </Button>
                )}
                {(status === "pendingApproval" || status === "deleted") && (
                  <Button
                    size="small"
                    className={approveButtonClasses}
                    onClick={() => approveMutation.mutate(entry.id)}
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Approve
                  </Button>
                )}
                {status !== "deleted" && (
                  <Button
                    size="small"
                    className={dangerButtonClasses}
                    confirmationMessage="Please confirm deletion!"
                    onClick={() => deleteMutation.mutate(entry.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </Button>
                )}
                {status === "deleted" && (
                  <Button
                    size="small"
                    className={dangerButtonClasses}
                    onClick={() => restoreMutation.mutate(entry.id)}
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          )}
        </Panel>

        {entry && (
          <>
            <Headline>Review or edit post:</Headline>
            <Panel>
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
