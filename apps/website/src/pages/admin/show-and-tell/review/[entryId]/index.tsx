import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";

import type { PublicShowAndTellEntryWithAttachments } from "@/server/db/show-and-tell";
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
  const [previewFormData, setPreviewFormData] =
    useState<Partial<PublicShowAndTellEntryWithAttachments> | null>(null);
  const shouldApproveAfterSaveRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

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

  const handlePreviewClick = useCallback(() => {
    if (!formRef.current) {
      setPreviewFormData(null);
      setIsPreviewOpen(true);
      return;
    }

    // Extract form data for preview
    const form = formRef.current;
    const formData = new FormData(form);

    setPreviewFormData({
      displayName: (formData.get("displayName") as string) || "",
      title: (formData.get("title") as string) || "",
      text: (formData.get("text") as string) || "",
      location: (formData.get("location") as string) || "",
      // Note: latitude/longitude and attachments would need more complex handling
      // For now, we'll use the existing entry's attachments
    });

    setIsPreviewOpen(true);
  }, []);

  const handleSaveAndApprove = useCallback(() => {
    if (!formRef.current || !entry) return;

    // Set flag to approve after save completes
    shouldApproveAfterSaveRef.current = true;

    // Trigger form submission which will save the data
    formRef.current.requestSubmit();
  }, [entry]);

  const handleSaveSuccess = useCallback(() => {
    // If we should approve after save, do it now
    if (shouldApproveAfterSaveRef.current && entry) {
      approveMutation.mutate(entry.id);
      shouldApproveAfterSaveRef.current = false;
    }
  }, [entry, approveMutation]);

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
                  onClick={handlePreviewClick}
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
                onSaveSuccess={handleSaveSuccess}
                formRef={formRef}
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
            formData={previewFormData ?? undefined}
            canApprove={status === "pendingApproval"}
            onApprove={handleSaveAndApprove}
          />
        )}
      </AdminPageLayout>
    </>
  );
};

export default AdminReviewShowAndTellPage;
