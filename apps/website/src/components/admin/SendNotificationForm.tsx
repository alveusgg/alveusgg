import { useRef } from "react";

import type { NotificationsConfig } from "../../config/notifications";
import { trpc } from "../../utils/trpc";

export const SendNotificationForm: React.FC<{
  notificationConfig: NotificationsConfig;
}> = ({ notificationConfig }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const runAction = trpc.adminAction.runAction.useMutation({
    onSuccess: () => {
      if (formRef.current) {
        formRef.current.reset();
      }
    },
  });

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        runAction.mutate({
          action: "sendNotification",
          text: String(data.get("text") || ""),
          tag: String(data.get("tag") || ""),
          heading: String(data.get("heading") || ""),
          url: String(data.get("url") || ""),
        });
      }}
    >
      {runAction.isLoading && (
        <p className="text-gray-700">Notification is being sent …</p>
      )}
      {runAction.isError && (
        <p className="text-red-800">ERROR: Could not send the notification!</p>
      )}

      <label className="block">
        <strong>Category:</strong>
        <br />

        <select name="tag" required defaultValue="announcements">
          <option></option>
          {notificationConfig.categories.map(({ tag, label }) => (
            <option key={tag} value={tag}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <strong>Heading:</strong>
        <br />
        <input
          name="heading"
          type="text"
          minLength={1}
          maxLength={100}
          defaultValue="Alveus announcement"
          required
        />
      </label>

      <label className="block">
        <strong>Text:</strong>
        <br />
        <textarea
          name="text"
          minLength={2}
          maxLength={200}
          defaultValue="Example content"
          required
        />
      </label>

      <label className="block">
        <strong>Link:</strong>
        <br />
        <input
          name="url"
          type="url"
          defaultValue="https://www.twitch.tv/AlveusSanctuary"
          required
        />
      </label>

      <button type="submit">Send notification</button>
    </form>
  );
};
