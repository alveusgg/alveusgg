import { ApiClient } from "@twurple/api";
import { getAuthProvider } from "@/twitch/auth";

let api: ApiClient;

async function createApi() {
  const authProvider = await getAuthProvider();
  return new ApiClient({ authProvider });
}

async function getApi() {
  if (!api) {
    api = await createApi();
  }

  return api;
}

export async function getChannelInfoById(userId: string) {
  const api = await getApi();
  return api.channels.getChannelInfoById(userId);
}
