import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useMemo } from "react";

import type { PublicShowAndTellEntryWithAttachments } from "@/server/db/show-and-tell";

import { classes } from "@/utils/classes";

import {
  Button,
  approveButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/form/Button";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";

import IconCheckCircle from "@/icons/IconCheckCircle";

type AdminShowAndTellPreviewModalProps = {
  entry: PublicShowAndTellEntryWithAttachments | null;
  newLocation: boolean;
  isOpen: boolean;
  closeModal: () => void;
  onSave?: () => void;
  onSaveAndApprove?: () => void;
  canApprove?: boolean;
  formData?: Partial<PublicShowAndTellEntryWithAttachments>;
};

export function AdminShowAndTellPreviewModal({
  entry,
  newLocation,
  isOpen,
  closeModal,
  onSave,
  onSaveAndApprove,
  canApprove = false,
  formData,
}: AdminShowAndTellPreviewModalProps) {
  // Merge entry with form data for preview
  const previewEntry = useMemo(() => {
    if (!entry) return null;
    if (!formData) return entry;

    return {
      ...entry,
      ...formData,
      // Preserve attachments unless new ones are provided
      attachments: formData.attachments || entry.attachments,
    };
  }, [entry, formData]);

  if (!entry || !previewEntry) return null;

  return (
    <Dialog
      as="div"
      open={isOpen}
      className="relative z-20"
      onClose={closeModal}
    >
      <div className="fixed inset-0 bg-black/25" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
            className={classes(
              "w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all",
              "max-w-4xl",
            )}
          >
            <DialogTitle
              as="h3"
              className="text-lg leading-6 font-medium text-gray-900"
            >
              Preview
            </DialogTitle>
            <div className="mt-2">
              <div className="max-h-[70vh] overflow-y-auto">
                <ShowAndTellEntry
                  entry={previewEntry}
                  newLocation={newLocation}
                  isPresentationView={false}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button onClick={closeModal} width="auto">
                Close
              </Button>
              {canApprove && onSaveAndApprove && (
                <Button
                  onClick={() => {
                    onSaveAndApprove();
                    closeModal();
                  }}
                  className={approveButtonClasses}
                  width="auto"
                >
                  <IconCheckCircle className="size-4" />
                  Save & Approve
                </Button>
              )}
              {!canApprove && onSave && (
                <Button
                  onClick={() => {
                    onSave();
                    closeModal();
                  }}
                  className={defaultButtonClasses}
                  width="auto"
                >
                  <IconCheckCircle className="size-4" />
                  Save
                </Button>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
