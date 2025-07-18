import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

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

// #region Modal Block Context

// Prevent closing if multiple layered modals are open
// at the same time (i.e. lightbox inside modal)

interface ModalBlockContextType {
  blockOuterModal: () => void;
  unblockOuterModal: () => void;
  keepModalOpen: boolean;
}

const ModalBlockContext = createContext<ModalBlockContextType | undefined>(
  undefined,
);

/**
 * Hook to access modal blocking control from {@link ModalBlockProvider}.
 *
 * Use this hook to programmatically block or unblock the closing of a modal.
 * Must be used inside a component tree wrapped with {@link ModalBlockProvider}.
 *
 * @throws Error if used outside a {@link ModalBlockProvider}
 *
 * @returns {{
 *   blockOuterModal: () => void;
 *   unblockOuterModal: () => void;
 *   keepModalOpen: boolean;
 * }}
 *
 * @see {@link ModalBlockProvider}
 * @example
 * const { blockOuterModal, unblockOuterModal, keepModalOpen } = useModalBlock();
 * blockOuterModal(); // Prevent modal from being closed
 * unblockOuterModal(); // Allow modal to be closed again
 */
export const useModalBlock = (): ModalBlockContextType => {
  const context = useContext(ModalBlockContext);
  if (!context) {
    throw new Error("useModalBlock must be used within a ModalBlockProvider");
  }
  return context;
};

/**
 * Provides context to control whether a {@link ModalDialog} can be closed.
 * Wrap this provider around any component tree that needs to block or allow modal closing.
 *
 * This is useful for cases where nested components (e.g. lightboxes or nested modals)
 * need to temporarily prevent the outer modal from closing.
 *
 * @see {@link useModalBlock}()
 * @example
 * <ModalBlockProvider>
 *   <ModalDialog ... />
 * </ModalBlockProvider>
 */
export const ModalBlockProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [keepModalOpen, setKeepModalOpen] = useState(false);

  const blockOuterModal = useCallback(() => {
    setKeepModalOpen(true);
  }, []);

  const unblockOuterModal = useCallback(() => {
    setKeepModalOpen(false);
  }, []);

  return (
    <ModalBlockContext.Provider
      value={{ blockOuterModal, unblockOuterModal, keepModalOpen }}
    >
      {children}
    </ModalBlockContext.Provider>
  );
};

// #endregion

export function ModalDialog({
  title,
  children,
  panelClassName = "max-w-md",
  closeLabel = "Okay",
  isOpen = true,
  closeModal,
}: ModalDialogProps) {
  const { keepModalOpen } = useModalBlock();

  if (!isOpen) return null;

  return (
    <Dialog
      as="div"
      open={isOpen}
      className="relative z-20"
      onClose={keepModalOpen ? () => {} : closeModal}
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
