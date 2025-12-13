import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parse, stringify } from "superjson";
import type { ParsedMessage } from "./types";

async function parseDeadLetterCandidates() {
  const completedFile = await readFile(
    join(__dirname, "../.scratchpad/complete-letters.json"),
    "utf8",
  );
  const completedMessages: ParsedMessage[] = JSON.parse(completedFile);
  const completed = new Set(
    completedMessages.map((message) => message.parsed.json.id),
  );
  const files = await readdir(join(__dirname, "../.scratchpad/dead-letters"));
  const output = [];

  for (const file of files) {
    const data = await readFile(
      join(__dirname, "../.scratchpad/dead-letters/", file),
      "utf8",
    );
    const messages = JSON.parse(data).result.messages;
    const body = [];
    for (const message of messages) {
      try {
        const superparsed = parse(
          JSON.parse(message.body),
        ) as ParsedMessage["parsed"]["json"];
        // if the keys of superparsed.tags are falsy, remove them
        if (superparsed.tags) {
          Object.keys(superparsed.tags).forEach((key) => {
            if (!superparsed.tags[key]) {
              delete superparsed.tags[key];
            }
          });
        }
        body.push({
          original: message.body,
          unescaped: stringify(superparsed),
          parsed: JSON.parse(JSON.parse(message.body)),
        });
      } catch (error) {
        console.error(`${file} ${message.body} ${error}`);
      }
    }
    output.push(...body);
  }

  const sorted = output.sort(
    (a, b) =>
      new Date(a.parsed.json.receivedAt).getTime() -
      new Date(b.parsed.json.receivedAt).getTime(),
  );

  const filtered = sorted.filter(
    (message: { parsed: { json: { id: string } } }) =>
      !completed.has(message.parsed.json.id),
  );
  console.log(filtered.length);

  writeFile(
    join(__dirname, "../.scratchpad/dead-letter-candidates.json"),
    JSON.stringify(filtered, null, 2),
  );
}

parseDeadLetterCandidates();
