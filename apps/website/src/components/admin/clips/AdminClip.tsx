import type { Clip } from "@prisma/client";

import { useState } from "react";
import { Button, dangerButtonClasses } from "@/components/shared/Button";
import DateTime from "@/components/content/DateTime";
import IconTrash from "@/icons/IconTrash";
import IconCheck from "@/icons/IconCheck";

type AdminClipProps = {
  clip: Clip;
  approveClip: (clip: Clip) => void;
  deleteClip: (clip: Clip) => void;
  showApprove: boolean;
};

const cellClasses = "p-1 md:p-2 align-top tabular-nums";

const ClipEmbed = ({ clipId }: { clipId: string }) => {
  const embedUrl = new URL("https://clips.twitch.tv/embed");
  embedUrl.searchParams.set("clip", clipId);
  embedUrl.searchParams.set("parent", window.location.hostname);

  return (
    <iframe
      src={embedUrl.toString()}
      className="h-96 w-full"
      allowFullScreen
    ></iframe>
  );
};

export function AdminClip({
  clip,
  approveClip,
  deleteClip,
  showApprove,
}: AdminClipProps) {
  const [embedShown, setEmbedShown] = useState(false);

  return (
    <tr className="border-t border-gray-800">
      <td className={`${cellClasses}`}>
        <strong>{clip.title}</strong>
      </td>
      <td className={`${cellClasses} font-semibold`}>
        <Button onClick={() => setEmbedShown(!embedShown)}>
          {embedShown ? "Hide Clip" : "View Clip"}
        </Button>
        {embedShown && <ClipEmbed clipId={clip.slug} />}
      </td>
      <td className={`${cellClasses} whitespace-nowrap`}>
        <DateTime date={clip.submittedAt} format={{ time: "minutes" }} />
      </td>
      <td className={`${cellClasses} flex flex-col gap-1`}>
        {showApprove && (
          <Button size="small" onClick={() => approveClip(clip)}>
            <IconCheck className="h-5 w-5" />
            Approve
          </Button>
        )}
        <div className="flex gap-1">
          <Button
            size="small"
            className={dangerButtonClasses}
            confirmationMessage="Please confirm deletion!"
            onClick={() => deleteClip(clip)}
          >
            <IconTrash className="h-5 w-5" />
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
