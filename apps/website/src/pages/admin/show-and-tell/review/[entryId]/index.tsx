import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useRef } from "react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";

import { getEntityStatus } from "@/utils/entity-helpers";
import { trpc } from "@/utils/trpc";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import DateTime from "@/components/content/DateTime";
import Meta from "@/components/content/Meta";
import { MessageBox } from "@/components/shared/MessageBox";
import {
  Button,
  approveButtonClasses,
  dangerButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/form/Button";
import { ShowAndTellEntryForm } from "@/components/show-and-tell/ShowAndTellEntryForm";

import IconCheckCircle from "@/icons/IconCheckCircle";
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

  // Store a reference to the form's confirmIfUnsaved function
  const confirmIfUnsavedRef = useRef<((message?: string) => boolean) | null>(
    null,
  );
  const setConfirmIfUnsaved = useCallback(
    (fn: (message?: string) => boolean) => {
      confirmIfUnsavedRef.current = fn;
    },
    [],
  );

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

  // Handlers that check for unsaved changes
  const handleApprove = useCallback(() => {
    if (
      confirmIfUnsavedRef.current?.(
        "You have unsaved changes. Approving will discard them. Do you want to continue?",
      ) === false
    ) {
      return;
    }
    if (entry) {
      approveMutation.mutate(entry.id);
    }
  }, [approveMutation, entry]);

  const handleRemoveApproval = useCallback(() => {
    if (
      confirmIfUnsavedRef.current?.(
        "You have unsaved changes. Removing approval will discard them. Do you want to continue?",
      ) === false
    ) {
      return;
    }
    if (!window.confirm("Please confirm removing the approval!")) {
      return;
    }
    if (entry) {
      removeApprovalMutation.mutate(entry.id);
    }
  }, [removeApprovalMutation, entry]);

  const handleDelete = useCallback(() => {
    if (
      confirmIfUnsavedRef.current?.(
        "You have unsaved changes. Deleting will discard them. Do you want to continue?",
      ) === false
    ) {
      return;
    }
    if (!window.confirm("Please confirm deletion!")) {
      return;
    }
    if (entry) {
      deleteMutation.mutate(entry.id);
    }
  }, [deleteMutation, entry]);

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
                {status === "approved" && (
                  <Button
                    size="small"
                    className={defaultButtonClasses}
                    onClick={handleRemoveApproval}
                  >
                    <IconMinus className="size-4" />
                    Remove approval
                  </Button>
                )}
                {status === "pendingApproval" && (
                  <Button
                    size="small"
                    className={approveButtonClasses}
                    onClick={handleApprove}
                  >
                    <IconCheckCircle className="size-4" />
                    Approve
                  </Button>
                )}
                <Button
                  size="small"
                  className={dangerButtonClasses}
                  onClick={handleDelete}
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
                onUnsavedChangesRef={setConfirmIfUnsaved}
              />
            </Panel>
          </>
        )}
      </AdminPageLayout>
    </>
  );
};

export default AdminReviewShowAndTellPage;
