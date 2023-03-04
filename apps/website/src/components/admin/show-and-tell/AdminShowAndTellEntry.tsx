import React from "react";
import type { ShowAndTellEntry, User } from "@prisma/client";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { LocalDateTime } from "../../shared/LocalDateTime";
import { Button, dangerButtonClasses, LinkButton } from "../../shared/Button";

type ShowAndTellEntryWithUser = ShowAndTellEntry & { user: User | null };

type AdminShowAndTellEntryProps = {
  entry: ShowAndTellEntryWithUser;
};

const cellClasses = "p-1 md:p-2 align-top tabular-nums";

export function AdminShowAndTellEntry({ entry }: AdminShowAndTellEntryProps) {
  return (
    <tr className="border-t border-gray-800">
      <td className={`${cellClasses}`}>
        <strong>{entry.displayName}</strong>
        <br />
        {entry.user?.name || <em>Anonymous</em>}
      </td>
      <td className={`${cellClasses} font-semibold`}>{entry.title || "n/a"}</td>
      <td className={`${cellClasses}`}>
        <LocalDateTime dateTime={entry.createdAt} />
        <br />
        {Number(entry.createdAt) !== Number(entry.updatedAt) && (
          <LocalDateTime dateTime={entry.updatedAt} />
        )}
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
