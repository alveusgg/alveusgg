import React from "react";
import type { ShowAndTellEntry, User } from "@prisma/client";

import { getEntityStatus } from "@/utils/entity-helpers";
import { formatDateTimeLocal } from "@/utils/datetime";

import {
  Button,
  dangerButtonClasses,
  LinkButton,
  secondaryButtonClasses,
} from "@/components/shared/Button";
import DateTime from "@/components/content/DateTime";
import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";
import IconEye from "@/icons/IconEye";
import IconPlus from "@/icons/IconPlus";
import IconCheck from "@/icons/IconCheck";
import IconArrowDown from "@/icons/IconArrowDown";

type ShowAndTellEntryWithUser = ShowAndTellEntry & { user: User | null };

type AdminShowAndTellEntryProps = {
  entry: ShowAndTellEntryWithUser;
  markSeen: (entry: ShowAndTellEntryWithUser, retroactive?: boolean) => void;
  unmarkSeen: (entry: ShowAndTellEntryWithUser) => void;
  deletePost: (entry: ShowAndTellEntryWithUser) => void;
};

const cellClasses = "p-1 md:p-2 align-top tabular-nums";

export function AdminShowAndTellEntry({
  entry,
  markSeen,
  unmarkSeen,
  deletePost,
}: AdminShowAndTellEntryProps) {
  const status = getEntityStatus(entry);

  return (
    <tr className="border-t border-gray-800">
      <td className={`${cellClasses}`}>
        <strong>{entry.displayName}</strong>
        <br />
        {entry.user?.name || <em>Anonymous</em>}
      </td>
      <td className={`${cellClasses} font-semibold`}>{entry.title || "n/a"}</td>
      <td className={`${cellClasses} whitespace-nowrap`}>
        <DateTime date={entry.createdAt} format={{ time: "minutes" }} />
        <br />
        {Number(entry.createdAt) !== Number(entry.updatedAt) && (
          <DateTime date={entry.updatedAt} format={{ time: "minutes" }} />
        )}
      </td>
      <td className={`${cellClasses} whitespace-nowrap`}>
        {entry.seenOnStreamAt && (
          <Button
            size="small"
            onClick={() => unmarkSeen(entry)}
            title={formatDateTimeLocal(entry.seenOnStreamAt)}
            className="bg-transparent"
          >
            <IconCheck className="h-5 w-5" />
          </Button>
        )}
        {!entry.seenOnStreamAt && status === "approved" && (
          <div className="flex flex-col gap-1">
            <Button
              size="small"
              className={secondaryButtonClasses}
              onClick={() => markSeen(entry)}
              title="Mark post as seen on stream"
            >
              <IconPlus className="h-5 w-5" /> Seen
            </Button>

            <Button
              size="small"
              className={secondaryButtonClasses}
              onClick={() => {
                if (confirm("Mark all posts until here as seen on stream?")) {
                  markSeen(entry, true);
                }
              }}
              title="Mark all posts until here as seen on stream"
            >
              <IconArrowDown className="h-5 w-5" /> All
            </Button>
          </div>
        )}
        {!entry.seenOnStreamAt && status === "pendingApproval" && "no"}
      </td>
      <td className={`${cellClasses} flex flex-col gap-1`}>
        <LinkButton
          size="small"
          href={`/admin/show-and-tell/review/${entry.id}`}
        >
          <IconPencil className="h-5 w-5" />
          Review
        </LinkButton>
        <div className="flex gap-1">
          <LinkButton
            size="small"
            className={secondaryButtonClasses}
            href={`/admin/show-and-tell/review/${entry.id}/preview`}
          >
            <IconEye className="h-5 w-5" />
            Preview
          </LinkButton>
          <Button
            size="small"
            className={dangerButtonClasses}
            confirmationMessage="Please confirm deletion!"
            onClick={() => deletePost(entry)}
          >
            <IconTrash className="h-5 w-5" />
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
