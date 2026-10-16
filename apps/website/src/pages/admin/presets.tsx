import type {
  InferGetServerSidePropsType,
  NextPage,
  NextPageContext,
} from "next";
import { getSession } from "next-auth/react";
import { useState } from "react";

import { getAdminSSP } from "@/server/utils/admin";

import { permissions } from "@/data/permissions";
import { controlCameraNames } from "@/data/tech/camera-identifiers";

import { trpc } from "@/utils/trpc";

import usePresetAccess from "@/hooks/preset-access";
import usePresetOperation from "@/hooks/preset-operation";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import Meta from "@/components/content/Meta";
import OperationStatus from "@/components/presets/OperationStatus";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const admin = await getAdminSSP(context, permissions.managePTZControls);
  if (!admin)
    return {
      redirect: {
        destination: session?.user?.id
          ? "/unauthorized"
          : "/auth/signin?callbackUrl=/admin/presets",
        permanent: false,
      },
    };
  return { props: admin };
}
const field =
  "rounded-sm border border-gray-500 bg-gray-800 px-3 py-2 text-white";
const button =
  "rounded-sm border border-gray-500 px-3 py-2 disabled:opacity-50";
const AdminPresets: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ menuItems }) => {
  const [camera, setCamera] = useState<string>("garden"),
    [name, setName] = useState("");
  const [pauseDuration, setPauseDuration] = useState("indefinite");
  const [rename, setRename] = useState<{ name: string; newName: string }>();
  const access = usePresetAccess();
  const catalog = trpc.presets.catalog.useQuery(
    { camera },
    { refetchInterval: 5000 },
  );
  const utils = trpc.useUtils();
  const pause = trpc.presets.setSubscriberControl.useMutation({
    onSuccess: () => utils.presets.access.invalidate(),
  });
  // Pausing stays available while moderation verification is down; resuming
  // needs full operator access.
  const canToggle = (paused: boolean | undefined) =>
    !pause.isPending &&
    (paused ? access.data?.canManage : access.data?.canPauseSubscribers);
  const togglePause = (paused: boolean, selected = false) =>
    pause.mutate({
      ...(selected ? { camera } : {}),
      paused,
      resumeAt:
        paused && pauseDuration !== "indefinite"
          ? new Date(Date.now() + Number(pauseDuration) * 60000).toISOString()
          : null,
    });
  const operation = usePresetOperation("presets:admin");
  const disabled = operation.busy || !access.data?.canManage || access.isError;
  return (
    <>
      <Meta title="Camera presets | Admin" />
      <AdminPageLayout title="Camera presets" menuItems={menuItems}>
        <Headline>Subscriber preset loading</Headline>
        <Panel>
          <p className="mb-3">
            Pause subscriber preset loading globally or for the selected camera.
            Operators can continue loading and managing presets. A pause does
            not stop a camera already moving.
          </p>
          <label>
            Pause duration{" "}
            <select
              className={field}
              value={pauseDuration}
              onChange={(event) => setPauseDuration(event.target.value)}
            >
              <option value="indefinite">Until enabled</option>
              <option value="15">15 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </label>
          <div className="my-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={button}
              disabled={!canToggle(access.data?.subscriberControlsPaused)}
              onClick={() =>
                togglePause(!access.data?.subscriberControlsPaused)
              }
            >
              {access.data?.subscriberControlsPaused
                ? "Enable subscriber preset loading"
                : "Pause subscriber preset loading"}
            </button>
            <button
              type="button"
              className={button}
              disabled={!canToggle(access.data?.pausedCameras.includes(camera))}
              onClick={() =>
                togglePause(!access.data?.pausedCameras.includes(camera), true)
              }
            >
              {access.data?.pausedCameras.includes(camera)
                ? `Enable subscriber preset loading for ${camera}`
                : `Pause subscriber preset loading for ${camera}`}
            </button>
          </div>
          <p>
            {access.isPending
              ? "Checking subscriber preset loading status..."
              : access.isError
                ? "Subscriber preset loading status is unavailable."
                : access.data?.subscriberControlsPaused
                  ? "Subscriber preset loading is paused globally."
                  : "Subscriber preset loading is enabled globally."}
          </p>
          {pause.isError && <p role="alert">{pause.error.message}</p>}
        </Panel>
        <Headline>Manage camera presets</Headline>
        <Panel>
          <p className="mb-4">
            Save captures the camera’s current position and image. Saving does
            not move the camera. Position the camera before saving.
          </p>
          {access.isError ? (
            <p role="alert">Unable to check preset permissions.</p>
          ) : !access.isPending && !access.data?.canManage ? (
            <p role="alert">
              {access.data?.reason === "banned"
                ? "Preset controls are unavailable while you are banned or timed out in Alveus Sanctuary chat."
                : access.data?.reason === "unavailable"
                  ? "Preset access verification is temporarily unavailable. Try again shortly."
                  : "PTZ control permission is required to manage presets."}
            </p>
          ) : null}
          <label className="flex max-w-lg flex-col gap-1">
            Camera
            <select
              value={camera}
              onChange={(event) => {
                setCamera(event.target.value);
                setRename(undefined);
              }}
              disabled={operation.busy}
              className={field}
            >
              {controlCameraNames.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <form
            className="my-4 flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              operation.run({ action: "save", camera, name: name.trim() });
            }}
          >
            <label className="flex flex-col gap-1">
              Preset name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                disabled={operation.busy}
                className={field}
              />
            </label>
            <button
              type="submit"
              disabled={disabled || !name.trim()}
              className={button}
            >
              Save current view
            </button>
          </form>
          <OperationStatus operation={operation} />
        </Panel>
        <Panel>
          <Headline>Presets for {camera}</Headline>
          {catalog.isPending ? (
            <p role="status">Loading presets...</p>
          ) : catalog.isError ? (
            <p role="alert">
              Unable to load presets.{" "}
              <button
                className="underline"
                onClick={() => void catalog.refetch()}
              >
                Retry
              </button>
            </p>
          ) : !catalog.data.length ? (
            <p>No presets yet.</p>
          ) : (
            <ul className="divide-y divide-gray-700">
              {catalog.data.map((preset) => (
                <li
                  key={preset.id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <span className="grow">
                    {preset.name}
                    {preset.provenance === "legacy" && (
                      <span className="ml-2 text-xs">
                        Archived; cannot load
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    className={button}
                    disabled={
                      disabled ||
                      !["capture", "control-api-import"].includes(
                        preset.provenance,
                      )
                    }
                    onClick={() =>
                      operation.run({
                        action: "load",
                        camera,
                        name: preset.name,
                      })
                    }
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    className={button}
                    disabled={disabled}
                    onClick={() =>
                      setRename({ name: preset.name, newName: preset.name })
                    }
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className={button}
                    disabled={disabled}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete preset “${preset.name}” from ${camera}?`,
                        )
                      )
                        operation.run({
                          action: "remove",
                          camera,
                          name: preset.name,
                        });
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
          {rename && (
            <form
              className="mt-4 flex flex-wrap gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                operation.run({
                  action: "rename",
                  camera,
                  name: rename.name,
                  newName: rename.newName.trim(),
                });
                setRename(undefined);
              }}
            >
              <label className="flex flex-col gap-1">
                Rename {rename.name}
                <input
                  required
                  maxLength={100}
                  className={field}
                  value={rename.newName}
                  disabled={disabled}
                  onChange={(event) =>
                    setRename({ ...rename, newName: event.target.value })
                  }
                />
              </label>
              <button
                type="submit"
                disabled={disabled || !rename.newName.trim()}
                className={button}
              >
                Save name
              </button>
              <button
                type="button"
                onClick={() => setRename(undefined)}
                className={button}
              >
                Cancel
              </button>
            </form>
          )}
          <button
            type="button"
            className={`${button} mt-4 border-red-500`}
            disabled={disabled || catalog.isError || !catalog.data?.length}
            onClick={() => {
              if (
                window.confirm(
                  `Delete ALL presets for ${camera}? This cannot be undone.`,
                )
              )
                operation.run({ action: "clear", camera });
            }}
          >
            Clear camera presets
          </button>
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default AdminPresets;
