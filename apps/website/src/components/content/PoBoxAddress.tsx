import { Fragment } from "react";

import { poBoxAddress } from "@/data/po-box";

import { classes } from "@/utils/classes";

import Box from "@/components/content/Box";
import CopyToClipboardButton from "@/components/shared/actions/CopyToClipboardButton";

import IconInformationCircle from "@/icons/IconInformationCircle";
import IconMapPin from "@/icons/IconMapPin";

const PoBoxAddress = ({ className }: { className?: string }) => (
  <Box className={classes("p-6", className)}>
    <div className="flex items-center justify-between gap-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-alveus-green-600 uppercase">
        <IconMapPin size={16} aria-hidden="true" />
        Ship to
      </p>
      <CopyToClipboardButton
        text={poBoxAddress.join("\n")}
        options={{ initialText: "Copy address" }}
      />
    </div>
    <address className="mt-2 font-serif text-2xl/snug font-bold not-italic">
      {poBoxAddress.map((line, idx) => (
        <Fragment key={line}>
          {idx > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </address>
    <p
      role="note"
      className="mt-5 flex gap-2 border-t-2 border-dashed border-alveus-green/30 pt-4 text-sm"
    >
      <IconInformationCircle
        className="mt-0.5 size-4 shrink-0"
        aria-hidden="true"
      />
      Please do not send anything to this address that is not intended for
      Alveus.
    </p>
  </Box>
);

export default PoBoxAddress;
