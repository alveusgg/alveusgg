import { checkUserIsAllowedToSendNotifications } from "@/users";
import { getChannelInfoById } from "@/twitch/api";
import { safeParsePartialURL } from "@/utils/safeParsePartialURL";
import { createNotification } from "@/website-api/notifications";

import {
  createBotCommand,
  type CommandHandler,
} from "@/bot/commands/shared/command";
import { createOptions } from "@/bot/commands/shared/options";

const defaultNotificationTitle = "Live Now";

type PendingNotification = {
  tag: "stream";
  text?: string;
  linkUrl?: string;
  imageUrl?: string;
  vodUrl?: string;
  title: string;
  timeout?: ReturnType<typeof setTimeout>;
  isPush: boolean;
  isDiscord: boolean;
};

// These URLs are likely not meant to be used as notification links without a path
const partialUrlFilterList = ["https://twitch.tv/", "https://youtube.com/"];

function createPendingNotification(
  data: Omit<PendingNotification, "timeout">,
): PendingNotification {
  return data;
}

const options = createOptions({
  help: {
    type: "boolean",
    default: false,
  },
  "no-discord": {
    type: "boolean",
    help: "Do not post in Discord",
    default: false,
  },
  "no-push": {
    type: "boolean",
    help: "Do not send a push",
    default: false,
  },
  image: {
    type: "url",
    help: "Set the image URL",
  },
  vod: {
    type: "url",
    help: "Set the VoD URL",
  },
});

function parseOptionalLinkUrl(broadcasterName: string, params: string[]) {
  let linkUrl = `https://twitch.tv/${broadcasterName}`;
  let restParams = params;
  const maybeUrl = safeParsePartialURL(params[0]);
  if (maybeUrl && !partialUrlFilterList.includes(maybeUrl)) {
    linkUrl = maybeUrl;
    restParams = params.slice(1);
  }
  return { linkUrl, restParams };
}

function parseTitleAndText(params: string[]) {
  const textParts = params.join(" ").split("|");
  const title = textParts[0]?.trim();
  const text = textParts.slice(1).join("/").trim();
  return { title, text };
}

function renderPendingNotification(notification: PendingNotification) {
  return [
    notification.tag,
    notification.title,
    notification.text,
    notification.linkUrl,
    notification.imageUrl ? "has image" : null,
    notification.vodUrl ? "has VoD" : null,
    notification.isPush ? "will push" : null,
    notification.isDiscord ? "will post in discord" : null,
  ]
    .filter((a) => a?.trim())
    .join(" | ");
}

function sendPendingNotification(
  notification: PendingNotification,
  reply: (message: string) => void,
) {
  createNotification({
    tag: notification.tag,
    text: notification.text,
    linkUrl: notification.linkUrl,
    title: notification.title,
    isDiscord: notification.isDiscord,
    isPush: notification.isPush,
    imageUrl: notification.imageUrl,
    vodUrl: notification.vodUrl,
  })
    .then(() => {
      reply("poggSpin sent notification");
    })
    .catch((e) => {
      console.error(e);
      reply("MADGIES failed to send notification");
    });
}

export async function createNotificationCommands() {
  const pendingNotifications = new Map<string, PendingNotification>();

  function clearPendingNotification(broadcasterId: string) {
    const pendingNotification = pendingNotifications.get(broadcasterId);
    if (!pendingNotification) return false;

    if (pendingNotification.timeout) {
      clearTimeout(pendingNotification.timeout);
    }
    pendingNotifications.delete(broadcasterId);
    return true;
  }

  const notificationCommand: CommandHandler = async (
    params,
    { broadcasterId, broadcasterName, userName, reply },
  ) => {
    const isMod = await checkUserIsAllowedToSendNotifications(userName);
    if (!isMod) {
      reply("mayaHalt you are not allowed to send notifications");
      return;
    }

    const {
      restParams: paramsWithoutOptions,
      values: optionValues,
      errors,
    } = options.parseParams(params);

    if (optionValues.help) {
      reply(
        `Usage: !notify [link] [title] [|text] | ` +
          `Cancel: !notify cancel | ` +
          `Notifications are sent automatically after 1 minute | ` +
          `Arguments: link = URL | ` +
          `Options: ${options.renderHelp()}`,
      );
      return;
    }

    if (errors.length) {
      reply(`Error: ${errors.join(", ")}`);
      return;
    }

    if (
      paramsWithoutOptions.length === 1 &&
      paramsWithoutOptions[0]?.toLowerCase() === "cancel"
    ) {
      if (clearPendingNotification(broadcasterId)) {
        reply("poggSpin cancelled notification");
      } else {
        reply("mojjcheck no pending notification");
      }
      return;
    }

    const { linkUrl, restParams } = parseOptionalLinkUrl(
      broadcasterName,
      paramsWithoutOptions,
    );
    let { title, text } = parseTitleAndText(restParams);

    if (!title) {
      const channelInfo = await getChannelInfoById(broadcasterId);
      if (channelInfo) {
        title = channelInfo.title.split("|")[0];
        text = channelInfo.gameName;
      }
    }

    title = title || defaultNotificationTitle;

    const pendingNotification = createPendingNotification({
      tag: "stream",
      linkUrl,
      title,
      text,
      isPush: !optionValues["no-push"],
      isDiscord: !optionValues["no-discord"],
      imageUrl: optionValues.image,
      vodUrl: optionValues.vod,
    });

    clearPendingNotification(broadcasterId);
    pendingNotifications.set(broadcasterId, pendingNotification);
    pendingNotification.timeout = setTimeout(() => {
      if (pendingNotifications.get(broadcasterId) !== pendingNotification) {
        return;
      }

      pendingNotifications.delete(broadcasterId);
      sendPendingNotification(pendingNotification, reply);
    }, 60_000);

    reply(
      `PauseChamp queued notification: ${renderPendingNotification(
        pendingNotification,
      )} | will send in 1 minute; use !notify cancel to cancel`,
    );
  };

  return [
    createBotCommand("notify", notificationCommand),
    createBotCommand("notification", notificationCommand),
  ];
}
