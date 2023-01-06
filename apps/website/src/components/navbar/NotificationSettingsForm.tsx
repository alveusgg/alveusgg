import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useMemo } from "react";
import debounce from "lodash/debounce";

import { trpc } from "../../utils/trpc";
import { usePushSubscription } from "../../utils/push-subscription";
import type { NotificationPermission } from "./NotificationPermission";
import { ErrorMessage } from "./NotificationPermission";
import { NotificationCategoryCheckbox } from "./NotificationCategoryCheckbox";

export const NotificationSettingsForm: React.FC<{
  notificationPermission: NotificationPermission | false;
}> = ({ notificationPermission }) => {
  const { endpoint, tags, isRegistered, updateTags } = usePushSubscription(
    notificationPermission
  );
  const config = trpc.notificationsConfig.getConfiguration.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const enableSettings = notificationPermission === "granted" && isRegistered;
  const handlePreferencesChange = useCallback(
    async (data: FormData) => {
      const tags: Record<string, string> = {};
      config.data?.categories.forEach(({ tag }) => {
        tags[tag] = String(
          data.has(`tag-${tag}`) ? data.get(`tag-${tag}`) : "0"
        );
      });
      await updateTags(tags);
    },
    [config.data?.categories, updateTags]
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

  if (config.isLoading) {
    return <p>Loading settings …</p>;
  }

  if (config.isError) {
    return <ErrorMessage>Error loading settings</ErrorMessage>;
  }

  if (!endpoint || !config.data?.categories.length) {
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
      <fieldset className="space-y-5">
        <legend className="sr-only">Notifications</legend>

        {notificationPermission === "granted" && !isRegistered && (
          <p>Setting up notifications …</p>
        )}

        {config.data?.categories.map((category) => (
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
};
