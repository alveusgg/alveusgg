import { publicProcedure, router } from "@/server/trpc/trpc";
import { getWeather } from "@/server/apis/weather";

export const streamRouter = router({
  getWeather: publicProcedure.query(getWeather),
});
