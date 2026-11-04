import type { ReactNode } from "react";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";

export function RenameStep({
  number,
  title,
  muted = false,
  children,
}: {
  number: number;
  title: string;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <Heading
        level={2}
        className={classes("flex items-center gap-3", muted && "opacity-60")}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-alveus-green font-sans text-lg text-alveus-tan">
          {number}
        </span>
        {title}
      </Heading>
      {/* From md up, line the content up with the heading text */}
      <div className="mt-4 space-y-6 md:pl-12">{children}</div>
    </div>
  );
}

function RenameStepPlaceholder({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-alveus-green-100/60 px-4 py-6 text-center text-alveus-green-800/80">
      {children}
    </p>
  );
}

/**
 * Steps 3 and 4 of the rename page. `confirm` is the login or search of the
 * chosen method, `rename` the pixels once that worked; both show a placeholder
 * until they are reachable.
 */
export function RenameStepsLayout({
  confirm,
  rename,
  renamePlaceholder = "Confirm it's you first.",
}: {
  confirm: ReactNode | null;
  rename: ReactNode | null;
  renamePlaceholder?: string;
}) {
  return (
    <>
      <RenameStep number={3} title="Confirm it's you" muted={!confirm}>
        {confirm ?? (
          <RenameStepPlaceholder>
            Pick how you donated first.
          </RenameStepPlaceholder>
        )}
      </RenameStep>

      <RenameStep number={4} title="Rename your pixels" muted={!rename}>
        {rename ?? (
          <RenameStepPlaceholder>
            {confirm ? renamePlaceholder : "Pick how you donated first."}
          </RenameStepPlaceholder>
        )}
      </RenameStep>
    </>
  );
}
