import React from "react";

import { Dialog } from "@headlessui/react";
import SubmitClipForm from "@/components/clips/SubmitClipForm";

type SubmitClipModalProps = {
  open: boolean;
  requestClose: () => void;
};

function SubmitClipModal({ open = true, requestClose }: SubmitClipModalProps) {
  return (
    <Dialog
      open={open}
      onClose={() => requestClose()}
      className="fixed inset-0 z-50 flex overflow-auto bg-black/75"
    >
      <Dialog.Panel className="relative m-auto flex w-4/5 max-w-[800px] flex-col rounded-lg border border-solid border-black bg-white px-2 pb-4 pt-10 sm:px-10 sm:py-10">
        <button
          className="absolute right-0 top-0 p-2"
          onClick={() => requestClose()}
        >
          <span className="sr-only">Close clip submission form</span>

          <svg
            className="h-6 w-6 cursor-pointer text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <Dialog.Title className="mb-4 text-center text-xl lg:text-xl">
          Submit a clip
        </Dialog.Title>

        <SubmitClipForm />
      </Dialog.Panel>
    </Dialog>
  );
}

export default SubmitClipModal;
