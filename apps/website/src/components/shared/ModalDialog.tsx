import { Dialog } from "@headlessui/react";
import type { ReactNode } from "react";
import { Button } from "@/components/shared/form/Button";

export type ModalDialogProps = {
  title: string;
  closeLabel?: string;
  children: ReactNode;
  isOpen?: boolean;
  closeModal: () => void;
};

export function ModalDialog({
  title,
  children,
  closeLabel = "Okay",
  isOpen = true,
  closeModal,
}: ModalDialogProps) {
  if (!isOpen) return null;

  return (
    <Dialog
      as="div"
      open={isOpen}
      className="relative z-10"
      onClose={closeModal}
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              {title}
            </Dialog.Title>
            <div className="mt-2">{children}</div>

            <div className="mt-4">
              <Button onClick={closeModal} width="auto">
                {closeLabel}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
