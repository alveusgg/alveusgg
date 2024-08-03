import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { useState } from "react";
import { permissions } from "@/data/permissions";
import { getAdminSSP } from "@/server/utils/admin";
import { getEntityStatus } from "@/utils/entity-helpers";
import { trpc } from "@/utils/trpc";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import DateTime from "@/components/content/DateTime";
import Meta from "@/components/content/Meta";
import {
  approveButtonClasses,
  Button,
  dangerButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/form/Button";
import { MessageBox } from "@/components/shared/MessageBox";
import { ShowAndTellEntryForm } from "@/components/show-and-tell/ShowAndTellEntryForm";
import IconCheckCircle from "@/icons/IconCheckCircle";
import IconEye from "@/icons/IconEye";
import IconEyeSlash from "@/icons/IconEyeSlash";
import IconMinus from "@/icons/IconMinus";
import IconPaperAirplane from "@/icons/IconPaperAirplane";
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
  const [newComment, setNewComment] = useState("");
  const { data: session } = useSession();
  const modId = session?.user?.id;

  const getEntry = trpc.adminShowAndTell.getEntry.useQuery(String(entryId), {
    enabled: !!entryId,
    select: (entry) =>
      entry && {
        ...entry,
        modComments: entry.modComments.map((comment) => ({
          ...comment,
          user: { ...comment.user },
        })),
      },
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

  const addModCommentMutation = trpc.adminShowAndTell.addModComment.useMutation(
    {
      onSettled: async () => {
        await getEntry.refetch();
      },
    },
  );
  const deleteModCommentMutation =
    trpc.adminShowAndTell.deleteModComment.useMutation({
      onSettled: async () => {
        await getEntry.refetch();
      },
    });
  const toggleCommentVisibilityMutation =
    trpc.adminShowAndTell.toggleCommentVisibility.useMutation({
      onSettled: async () => {
        await getEntry.refetch();
      },
    });

  const handleAddComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!entryId || !newComment.trim()) return;

    addModCommentMutation.mutate({
      entryId: String(entryId),
      modId: String(modId),
      comment: newComment,
      isInternal: true,
    });

    setNewComment("");
  };

  const deleteComment = (commentId: string) => {
    deleteModCommentMutation.mutate(commentId);
  };

  const toggleCommentVisibility = (commentId: string, isInternal: boolean) => {
    toggleCommentVisibilityMutation.mutate({ commentId, isInternal });
  };

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
            <Headline>Mod comments:</Headline>
            <Panel>
              {entry.modComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex flex-row items-center justify-between border-b py-2"
                >
                  <div>
                    <span className="font-bold">{comment.user.name}</span> (
                    <DateTime
                      date={comment.createdAt}
                      format={{ time: "minutes" }}
                    />
                    ): {comment.comment}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      className={defaultButtonClasses}
                      onClick={() =>
                        toggleCommentVisibility(comment.id, comment.isInternal)
                      }
                    >
                      {comment.isInternal ? (
                        <>
                          <IconEye className="h-6 w-6" /> Make Public
                        </>
                      ) : (
                        <>
                          <IconEyeSlash className="h-6 w-6" /> Make Private
                        </>
                      )}
                    </Button>
                    <Button
                      size="small"
                      className={dangerButtonClasses}
                      confirmationMessage="Please confirm deletion!"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <IconTrash className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              <form onSubmit={handleAddComment} className="mt-4 flex">
                <input
                  type="text"
                  name="comment"
                  placeholder="Add a comment..."
                  className="flex-1 rounded-l border p-2 text-black"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-r p-2 text-white"
                >
                  <IconPaperAirplane className="h-6 w-6" />
                </button>
              </form>
            </Panel>
          </>
        )}

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
