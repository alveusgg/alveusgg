import { ImageResponse } from "next/og";
import { Client } from "@planetscale/database";

import { env } from "@/env";

import { mapStickerIdToPath } from "@/utils/virtual-tickets";
import { stickerPack, ticketConfig } from "@/data/events/fall-carnival-2023";
import { virtualTicketCustomizationSchema } from "@/server/utils/virtual-tickets";

import {
  Sticker,
  type StickerProps,
} from "@/components/events/virtual-ticket/elements/Sticker";

// TODO: Do not hard code the ticket component
import { FallCarnival2023Ticket } from "@/components/events/fall-carnival-2023/VirtualTicket";

export const runtime = "edge";

const db = new Client({
  url: env.DATABASE_URL,
});

export async function GET(
  request: Request,
  { params: { user, event } }: { params: { user: string; event: string } },
) {
  try {
    const conn = db.connection();
    const row = (
      await conn.execute(
        "SELECT vt.customization FROM VirtualTicket vt JOIN User u ON vt.userId = u.id WHERE u.name = ? AND vt.eventId = ? LIMIT 1",
        [user, event],
        { as: "object" },
      )
    ).rows?.[0];
    if (!row) {
      return new Response("Row not found", { status: 404 });
    }

    const customization = virtualTicketCustomizationSchema.safeParse(
      JSON.parse((row as { customization: string }).customization),
    );
    if (!customization.success) {
      return new Response("Could not parse customization", { status: 404 });
    }

    const stickers = customization.data.stickers;

    const fontPtSansBold = await fetch(
      new URL(
        "../../../../../../node_modules/@fontsource/pt-sans/files/pt-sans-latin-700-normal.woff",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer());

    const imageRes = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontFamily: '"PTSans"',
            color: "black",
            width: "100%",
            height: "100%",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FallCarnival2023Ticket userName={user} {...ticketConfig}>
            {stickers
              .map((sticker) => ({
                x: sticker.x,
                y: sticker.y,
                image:
                  env.NEXT_PUBLIC_BASE_URL +
                  mapStickerIdToPath(stickerPack.stickers, sticker.imageId),
              }))
              .filter(
                (sticker): sticker is StickerProps =>
                  sticker.image !== undefined,
              )
              .map((sticker) => (
                <Sticker key={sticker.image} {...sticker} />
              ))}
          </FallCarnival2023Ticket>
        </div>
      ),
      {
        width: 899,
        height: 350,
        fonts: [
          {
            name: "PTSans",
            data: fontPtSansBold,
            weight: 700,
            style: "normal",
          },
        ],
      },
    );

    imageRes.headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=31536000, stale-while-revalidate, stale-if-error",
    );

    return imageRes;
  } catch (e: unknown) {
    console.error(`${(e as Error).message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
