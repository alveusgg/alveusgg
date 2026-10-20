import type { Thing, WithContext } from "schema-dts";

const JsonLD = <T extends Thing>({ data }: { data: WithContext<T> }) => (
  <script
    type="application/ld+json"
    // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- Escape '<' so JSON cannot close the script element.
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);

export default JsonLD;
