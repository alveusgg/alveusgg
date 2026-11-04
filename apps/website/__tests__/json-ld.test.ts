import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

import JsonLD from "@/components/content/JsonLD";

test("JSON-LD content cannot close its script element", () => {
  const name = '</script><script>alert("example")</script>';
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
  } as const;
  const html = renderToStaticMarkup(createElement(JsonLD, { data }));

  expect(html.match(/<script/g)).toHaveLength(1);
  expect(html.match(/<\/script>/g)).toHaveLength(1);
  expect(
    JSON.parse(html.slice(html.indexOf(">") + 1, html.lastIndexOf("<"))),
  ).toEqual(data);
});
