import type { PublicShowAndTellEntryWithAttachments } from "@/server/db/show-and-tell";

import { ModalDialog } from "@/components/shared/ModalDialog";
import { ShowAndTellEntry } from "@/components/show-and-tell/ShowAndTellEntry";

type AdminShowAndTellPreviewModalProps = {
  entry: PublicShowAndTellEntryWithAttachments | null;
  newLocation: boolean;
  isOpen: boolean;
  closeModal: () => void;
};

export function AdminShowAndTellPreviewModal({
  entry,
  newLocation,
  isOpen,
  closeModal,
}: AdminShowAndTellPreviewModalProps) {
  if (!entry) return null;

  return (
    <ModalDialog
      title="Preview"
      closeLabel="Close"
      isOpen={isOpen}
      closeModal={closeModal}
      panelClassName="max-w-4xl"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <ShowAndTellEntry
          entry={entry}
          newLocation={newLocation}
          isPresentationView={false}
        />
      </div>
    </ModalDialog>
  );
}
