import { z } from "zod";
import { router, superUserProcedure } from "../../trpc";
import { sendNotification } from "../../../actions/send-notification";
import { env } from "../../../../env/server.mjs";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("sendNotification"),
    tag: z.string().min(2).max(100),
    text: z.string().min(2).max(200),
    heading: z.string().optional(),
    url: z.string().url().optional(),
  }),
]);

export const adminActionRouter = router({
  runAction: superUserProcedure
    .input(actionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        switch (input.action) {
          case "sendNotification":
            await sendNotification({
              tag: input.tag,
              text: input.text,
              heading: input.heading,
              url: input.url || env.NEXTAUTH_URL,
            });
        }
      } catch (error) {
        console.log(error);
      }
    }),
});
