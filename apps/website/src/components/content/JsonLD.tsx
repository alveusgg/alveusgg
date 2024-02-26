import type { Thing, WithContext } from "schema-dts";

const JsonLD = <T extends Thing>({ data }: { data: WithContext<T> }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

export default JsonLD;
