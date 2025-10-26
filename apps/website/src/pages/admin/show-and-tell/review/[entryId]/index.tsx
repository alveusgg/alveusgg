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
import type { FileReference } from "@/components/shared/form/UploadAttachmentsField";
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
  const currentAttachmentsRef = useRef<{
    imageFiles: FileReference[];
    videoUrls: string[];
  }>({ imageFiles: [], videoUrls: [] });

  const handleAttachmentsChange = useCallback(
    (data: { imageFiles: FileReference[]; videoUrls: string[] }) => {
      currentAttachmentsRef.current = data;
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

  const handlePreviewClick = useCallback(() => {
    if (!formRef.current || !entry) {
      setPreviewFormData(null);
      setIsPreviewOpen(true);
      return;
    }

    // Extract form data for preview
    const form = formRef.current;
    const formData = new FormData(form);

    // Get current attachment state
    const { imageFiles, videoUrls } = currentAttachmentsRef.current;

    // Build attachment previews - filter and map based on file status
    const imageAttachments = imageFiles
      .map((file, idx) => {
        // Handle saved files (existing attachments)
        if (file.status === "saved") {
          const existingAttachment = entry.attachments.find(
            (a) => a.imageAttachment?.id === file.id,
          );
          return existingAttachment || null;
        }

        // Handle uploaded files
        if (file.status === "upload.done") {
          return {
            id: `preview-image-${idx}`,
            entryId: entry.id,
            attachmentType: "image" as const,
            showAndTellEntryId: entry.id,
            linkAttachmentId: null,
            imageAttachmentId: file.id,
            linkAttachment: null,
            imageAttachment: {
              id: file.id,
              fileStorageObjectId: file.fileStorageObjectId,
              url: file.url,
              alt: null,
              caption: null,
              fileStorageObject: null,
            },
          };
        }

        // Handle files with data URLs (pending/initial)
        if (
          file.status === "upload.pending" ||
          file.status === "upload.failed"
        ) {
          return {
            id: `preview-image-${idx}`,
            entryId: entry.id,
            attachmentType: "image" as const,
            showAndTellEntryId: entry.id,
            linkAttachmentId: null,
            imageAttachmentId: `temp-${idx}`,
            linkAttachment: null,
            imageAttachment: {
              id: `temp-${idx}`,
              fileStorageObjectId: null,
              url: file.dataURL,
              alt: null,
              caption: null,
              fileStorageObject: null,
            },
          };
        }

        return null;
      })
      .filter((a) => a !== null);

    const videoAttachments = videoUrls.map((url, idx) => {
      // Check if this video was in the original entry
      const existingVideo = entry.attachments.find(
        (a) => a.linkAttachment?.url === url,
      );

      if (existingVideo) {
        return existingVideo;
      }

      return {
        id: `preview-video-${idx}`,
        entryId: entry.id,
        attachmentType: "video" as const,
        showAndTellEntryId: entry.id,
        linkAttachmentId: `preview-link-${idx}`,
        imageAttachmentId: null,
        linkAttachment: {
          id: `preview-link-${idx}`,
          url,
        },
        imageAttachment: null,
      };
    });

    setPreviewFormData({
      displayName: (formData.get("displayName") as string) || "",
      title: (formData.get("title") as string) || "",
      text: (formData.get("text") as string) || "",
      location: (formData.get("location") as string) || "",
      attachments: [...imageAttachments, ...videoAttachments],
    } as Partial<PublicShowAndTellEntryWithAttachments>);

    setIsPreviewOpen(true);
  }, [entry]);

  const handleSaveAndApprove = useCallback(() => {
    if (!formRef.current || !entry) return;

    // Set flag to approve after save completes
    shouldApproveAfterSaveRef.current = true;

    // Trigger form submission which will save the data
    formRef.current.requestSubmit();
  }, [entry]);

  const handleSave = useCallback(() => {
    if (!formRef.current || !entry) return;

    // Just save without approving
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
                onAttachmentsChange={handleAttachmentsChange}
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
            onSaveAndApprove={handleSaveAndApprove}
            onSave={handleSave}
          />
        )}
      </AdminPageLayout>
    </>
  );
};

export default AdminReviewShowAndTellPage;
