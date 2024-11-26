import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";
import { Button } from "@/components/shared/form/Button";
import { classes } from "@/utils/classes";

export type ModalDialogProps = {
  title: string;
  closeLabel?: string;
  children: ReactNode;
  panelClassName?: string;
  isOpen?: boolean;
  closeModal: () => void;
};

export function ModalDialog({
  title,
  children,
  panelClassName = "max-w-md",
  closeLabel = "Okay",
  isOpen = true,
  closeModal,
}: ModalDialogProps) {
  if (!isOpen) return null;

  return (
    <Dialog
      as="div"
      open={isOpen}
      className="relative z-20"
      onClose={closeModal}
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel
            className={classes(
              "w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all",
              panelClassName,
            )}
          >
            <DialogTitle
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              {title}
            </DialogTitle>
            <div className="mt-2">{children}</div>

            <div className="mt-4">
              <Button onClick={closeModal} width="auto">
                {closeLabel}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
