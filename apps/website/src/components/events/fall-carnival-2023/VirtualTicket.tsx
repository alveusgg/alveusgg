import { ticketConfig } from "@/data/events/fall-carnival-2023";

import { getShortBaseUrl } from "@/utils/short-url";

import { QRCode } from "@/components/QrCode";

import { Ticket, type TicketProps } from "../virtual-ticket/Ticket";

export type FallCarnival2023TicketProps = Pick<TicketProps, "children"> & {
  userName: string;
};

export function FallCarnival2023Ticket({
  userName,
  children,
}: FallCarnival2023TicketProps) {
  return (
    <Ticket
      {...ticketConfig}
      maskImage={ticketConfig.maskImage}
      additionalElements={
        <QRCode
          style={{
            position: "absolute",
            width: 110,
            height: 110,
            top: 122,
            right: 43,
            pointerEvents: "none",
            userSelect: "none",
            color: "#e0d8d0",
          }}
          value={`${getShortBaseUrl()}/fc23/${encodeURIComponent(userName)}`}
        />
      }
    >
      {children}

      <div
        style={{
          display: "flex",
          position: "absolute",
          width: ticketConfig.canvasWidth - 74,
          top: 150,
          left: 75,
          fontSize: 34,
          fontWeight: "bold",
          color: "#4E1362",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            alignItems: "center",
            pointerEvents: "none",
            userSelect: "none",
            // NOTE: Not supported by satori (yet)
            //WebkitTextStrokeWidth: 2,
            //WebkitTextStrokeColor: "rgb(224, 217, 200)",
            // Using text shadow instead
            textShadow:
              "0 0 2px rgb(224, 217, 200), 0 0 2px rgb(224, 217, 200), 0 0 2px rgb(224, 217, 200), 0 0 2px rgb(224, 217, 200), 0 0 2px rgb(224, 217, 200), 1px 1px 7px rgba(0, 0, 0, 0.7)",
          }}
        >
          {`Ticket for ${userName}`}
        </div>
      </div>
    </Ticket>
  );
}
