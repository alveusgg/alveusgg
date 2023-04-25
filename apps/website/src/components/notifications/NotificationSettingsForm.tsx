import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useMemo } from "react";
import debounce from "lodash/debounce";

import { usePushSubscription } from "@/utils/push-subscription";
import { notificationCategories } from "@/config/notifications";

import type { NotificationPermission } from "./NotificationPermission";
import { NotificationCategoryCheckbox } from "./NotificationCategoryCheckbox";

export function NotificationSettingsForm({
  notificationPermission,
}: {
  notificationPermission: NotificationPermission | false;
}) {
  const { endpoint, tags, isRegistered, updateTags } = usePushSubscription(
    notificationPermission
  );
  const enableSettings = notificationPermission === "granted" && isRegistered;
  const handlePreferencesChange = useCallback(
    async (data: FormData) => {
      const tags: Record<string, string> = {};
      notificationCategories.forEach(({ tag }) => {
        tags[tag] = String(
          data.has(`tag-${tag}`) ? data.get(`tag-${tag}`) : "0"
        );
      });
      await updateTags(tags);
    },
    [updateTags]
  );

  const submitHandler = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (enableSettings && event.currentTarget) {
        await handlePreferencesChange(new FormData(event.currentTarget));
      }
    },
    [enableSettings, handlePreferencesChange]
  );

  const debouncedHandlePreferencesChange = useMemo(
    () => debounce(handlePreferencesChange, 200),
    [handlePreferencesChange]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (enableSettings && event.currentTarget.form) {
        debouncedHandlePreferencesChange(
          new FormData(event.currentTarget.form)
        );
      }
    },
    [debouncedHandlePreferencesChange, enableSettings]
  );

  if (!endpoint) {
    return null;
  }

  return (
    <form
      onSubmit={submitHandler}
      className={
        enableSettings
          ? ""
          : "pointer-none cursor-default select-none opacity-50"
      }
    >
      <fieldset className="mx-2 space-y-1">
        <legend className="sr-only">Notifications</legend>

        {notificationPermission === "granted" && !isRegistered && (
          <p>Setting up notifications …</p>
        )}

        {notificationCategories.map((category) => (
          <NotificationCategoryCheckbox
            key={category.tag}
            tag={category.tag}
            label={category.label}
            tags={tags}
            enabled={enableSettings}
            endpoint={endpoint}
            handleChange={handleChange}
            isRegistered={isRegistered}
          />
        ))}
      </fieldset>
    </form>
  );
}
