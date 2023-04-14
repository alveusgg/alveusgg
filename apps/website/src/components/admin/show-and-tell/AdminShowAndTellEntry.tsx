import React from "react";
import type { ShowAndTellEntry, User } from "@prisma/client";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ArrowDownIcon, CheckIcon, PlusIcon } from "@heroicons/react/20/solid";
import { getEntityStatus } from "@/utils/entity-helpers";
import { formatDateUTC } from "@/utils/datetime";
import { LocalDateTime } from "../../shared/LocalDateTime";
import {
  Button,
  dangerButtonClasses,
  LinkButton,
  secondaryButtonClasses,
} from "../../shared/Button";

type ShowAndTellEntryWithUser = ShowAndTellEntry & { user: User | null };

type AdminShowAndTellEntryProps = {
  entry: ShowAndTellEntryWithUser;
  markSeen: (entry: ShowAndTellEntryWithUser, retroactive?: boolean) => void;
  unmarkSeen: (entry: ShowAndTellEntryWithUser) => void;
};

const cellClasses = "p-1 md:p-2 align-top tabular-nums";

export function AdminShowAndTellEntry({
  entry,
  markSeen,
  unmarkSeen,
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
        <LocalDateTime dateTime={entry.createdAt} />
        <br />
        {Number(entry.createdAt) !== Number(entry.updatedAt) && (
          <LocalDateTime dateTime={entry.updatedAt} />
        )}
      </td>
      <td className={`${cellClasses} whitespace-nowrap`}>
        {entry.seenOnStreamAt && (
          <Button
            size="small"
            onClick={() => unmarkSeen(entry)}
            title={formatDateUTC(entry.seenOnStreamAt)}
            className="bg-transparent"
          >
            <CheckIcon className="h-5 w-5" />
          </Button>
        )}
        {!entry.seenOnStreamAt && status === "approved" && (
          <div className="flex flex-col gap-1">
            <Button
              size="small"
              className={
                entry.seenOnStreamAt === null
                  ? secondaryButtonClasses
                  : dangerButtonClasses
              }
              onClick={() => markSeen(entry)}
              title="Mark post as seen on stream"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>

            <Button
              size="small"
              className={
                entry.seenOnStreamAt === null
                  ? secondaryButtonClasses
                  : dangerButtonClasses
              }
              onClick={() => {
                if (confirm("Mark all posts until here as seen on stream?")) {
                  markSeen(entry, true);
                }
              }}
              title="Mark all posts until here as seen on stream"
            >
              <ArrowDownIcon className="h-5 w-5" />
            </Button>
          </div>
        )}
        {!entry.seenOnStreamAt && status === "pendingApproval" && "no"}
      </td>
      <td className={`${cellClasses} flex flex-col gap-1`}>
        <LinkButton
          width="auto"
          size="small"
          href={`/admin/show-and-tell/review/${entry.id}`}
        >
          <PencilIcon className="h-5 w-5" />
          Review
        </LinkButton>
        <Button
          width="auto"
          size="small"
          className={dangerButtonClasses}
          confirmationMessage="Please confirm deletion!"
        >
          <TrashIcon className="h-5 w-5" />
          Delete
        </Button>
      </td>
    </tr>
  );
}
