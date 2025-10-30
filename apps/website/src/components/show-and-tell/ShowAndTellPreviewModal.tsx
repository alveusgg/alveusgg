import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import type { PublicShowAndTellEntryWithAttachments } from "@/server/db/show-and-tell";

import { classes } from "@/utils/classes";

import { Button } from "@/components/shared/form/Button";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";

type ShowAndTellPreviewModalProps = {
  entry: PublicShowAndTellEntryWithAttachments | null;
  newLocation: boolean;
  isOpen: boolean;
  closeModal: () => void;
};

export function ShowAndTellPreviewModal({
  entry,
  newLocation,
  isOpen,
  closeModal,
}: ShowAndTellPreviewModalProps) {
  if (!entry) return null;

  return (
    <Dialog
      as="div"
      open={isOpen}
      className="relative z-[100]"
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
                  entry={entry}
                  newLocation={newLocation}
                  isPresentationView={false}
                />
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={closeModal} width="auto">
                Close
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
