import type { ShowAndTellEntry, User } from "@alveusgg/database";

import type { MarkPostAsSeenMode } from "@/server/db/show-and-tell";

import { formatDateTimeLocal } from "@/utils/datetime";
import { getEntityStatus } from "@/utils/entity-helpers";

import DateTime from "@/components/content/DateTime";
import {
  Button,
  LinkButton,
  dangerButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";

import IconArrowDown from "@/icons/IconArrowDown";
import IconArrowUp from "@/icons/IconArrowUp";
import IconCheck from "@/icons/IconCheck";
import IconEye from "@/icons/IconEye";
import IconPencil from "@/icons/IconPencil";
import IconPlus from "@/icons/IconPlus";
import IconTrash from "@/icons/IconTrash";

type ShowAndTellEntryWithUser = ShowAndTellEntry & { user: User | null };

type AdminShowAndTellEntryProps = {
  entry: ShowAndTellEntryWithUser;
  markSeen: (
    entry: ShowAndTellEntryWithUser,
    mode?: MarkPostAsSeenMode,
  ) => void;
  unmarkSeen: (entry: ShowAndTellEntryWithUser) => void;
  deletePost: (entry: ShowAndTellEntryWithUser) => void;
  onPreview?: (entry: ShowAndTellEntryWithUser) => void;
};

const cellClasses = "p-1 md:p-2 align-top tabular-nums";

export function AdminShowAndTellEntry({
  entry,
  markSeen,
  unmarkSeen,
  deletePost,
  onPreview,
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
            <IconCheck className="size-5" />
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
              <IconPlus className="size-5" /> Seen
            </Button>

            <div className="flex gap-1">
              <Button
                size="small"
                className={secondaryButtonClasses}
                onClick={() => {
                  if (
                    confirm(
                      "Mark this post and all NEWER posts as seen on stream?",
                    )
                  ) {
                    markSeen(entry, "thisAndNewer");
                  }
                }}
                title="Mark this post and all newer posts as seen on stream"
              >
                <IconArrowUp className="size-5" />
              </Button>

              <Button
                size="small"
                className={secondaryButtonClasses}
                onClick={() => {
                  if (
                    confirm(
                      "Mark this post and all OLDER posts as seen on stream?",
                    )
                  ) {
                    markSeen(entry, "thisAndOlder");
                  }
                }}
                title="Mark this post and all older posts as seen on stream"
              >
                <IconArrowDown className="size-5" />
              </Button>
            </div>
          </div>
        )}
        {!entry.seenOnStreamAt && status === "pendingApproval" && "no"}
      </td>
      <td className={`${cellClasses} flex flex-col gap-1`}>
        <LinkButton
          size="small"
          href={`/admin/show-and-tell/review/${entry.id}`}
        >
          <IconPencil className="size-5" />
          Review
        </LinkButton>
        <div className="flex gap-1">
          {onPreview ? (
            <Button
              size="small"
              className={secondaryButtonClasses}
              onClick={() => onPreview(entry)}
            >
              <IconEye className="size-5" />
              Preview
            </Button>
          ) : (
            <LinkButton
              size="small"
              className={secondaryButtonClasses}
              href={`/admin/show-and-tell/review/${entry.id}/preview`}
            >
              <IconEye className="size-5" />
              Preview
            </LinkButton>
          )}
          <Button
            size="small"
            className={dangerButtonClasses}
            confirmationMessage="Please confirm deletion!"
            onClick={() => deletePost(entry)}
          >
            <IconTrash className="size-5" />
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
