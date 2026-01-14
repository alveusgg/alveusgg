import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";

import { classes } from "@/utils/classes";

import { Button } from "@/components/shared/form/Button";

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
      className="relative z-100"
      onClose={closeModal}
    >
      <div className="fixed inset-0 bg-black/25" />

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
              className="text-lg leading-6 font-medium text-gray-900"
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
