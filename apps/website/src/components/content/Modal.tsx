import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { type ReactNode, type RefObject } from "react";

import Box from "@/components/content/Box";
import Heading from "@/components/content/Heading";

import IconX from "@/icons/IconX";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  initialFocus?: RefObject<HTMLElement | null>;
};

const Modal = ({
  open,
  onClose,
  title,
  children,
  initialFocus,
}: ModalProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    initialFocus={initialFocus}
    className="relative z-50"
  >
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl shadow-2xl">
        <Box className="flow-root overflow-visible rounded-2xl shadow-none">
          <DialogTitle
            as={Heading}
            level={2}
            className="mt-0 mb-4 flex items-start gap-2"
          >
            <div className="grow">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 shrink-0 p-2 transition-colors hover:text-alveus-green"
              title="Close"
            >
              <IconX />
            </button>
          </DialogTitle>

          {children}
        </Box>
      </DialogPanel>
    </div>
  </Dialog>
);

export default Modal;
