import { getWeather } from "@/server/apis/weather";
import { publicProcedure, router } from "@/server/trpc/trpc";

export const streamRouter = router({
  getWeather: publicProcedure.query(getWeather),
});
