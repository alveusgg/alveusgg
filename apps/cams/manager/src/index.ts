import { Hono } from "hono";

import { eventsub } from "./routes/eventsub.ts";

export { CamControllerDurableObject } from "./cams/controller.ts";
export { TwitchChat } from "./chat/twitch-chat.ts";

const app = new Hono<{ Bindings: Env }>().route("/twitch/eventsub", eventsub);

export default app satisfies ExportedHandler<Env>;
