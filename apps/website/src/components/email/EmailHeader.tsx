import { env } from "@/env/index.mjs";

import { Image } from "./Image";
import { Row } from "./Row";

const baseUrl = env.NEXT_PUBLIC_BASE_URL;

export function EmailHeader() {
  return (
    <Row>
      <Row.Column align="left">
        <h1 style={{ fontSize: 30 }}>Alveus Sanctuary</h1>
      </Row.Column>
      <Row.Column align="right">
        <Image
          src={`${baseUrl}/assets/logo.png`}
          alt=""
          style={{ width: 40, height: 40 }}
        />
      </Row.Column>
    </Row>
  );
}
