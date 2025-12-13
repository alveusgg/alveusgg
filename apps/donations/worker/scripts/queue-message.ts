import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { inspect } from "node:util";
import { prompt } from "enquirer";
import type { ParsedMessage } from "./types";

const token = process.env.TOKEN;
const accountId = process.env.ACCOUNT_ID;
const queueId = process.env.MAIN_QUEUE_ID;

async function addToCompletedMessages(message: ParsedMessage) {
  const completedMessagesFile = await readFile(
    join(__dirname, "../.scratchpad/complete-letters.json"),
    "utf8",
  );
  const completedMessages: ParsedMessage[] = JSON.parse(completedMessagesFile);
  completedMessages.push(message);
  await writeFile(
    join(__dirname, "../.scratchpad/complete-letters.json"),
    JSON.stringify(completedMessages, null, 2),
  );
}

async function queueMessage(message: string) {
  console.log(inspect(JSON.parse(message), { depth: null, colors: true }));

  const go = await waitForConfirmationFromStdIn();
  if (!go) {
    console.log("Aborting...");
    return false;
  }
  console.log("Sending message to queue...");

  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/queues/${queueId}/messages/batch`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: [
          {
            body: message,
            content_type: "text",
          },
        ],
      }),
    },
  );

  if (!resp.ok) {
    console.error(`Failed to send message to queue: ${resp.statusText}`);
    console.error(await resp.text());
    throw new Error(`Failed to send message to queue: ${resp.statusText}`);
  }

  console.log(`Message sent to queue successfully: ${resp.statusText}`);
  console.log(await resp.text());

  return true;
}

async function main() {
  const messagesFile = await readFile(
    join(__dirname, "../.scratchpad/dead-letter-candidates.json"),
    "utf8",
  );
  const messages: ParsedMessage[] = JSON.parse(messagesFile);
  for (const message of messages) {
    const success = await queueMessage(message.unescaped);
    if (success) {
      console.log("Message sent to queue successfully, continuing...");
      await addToCompletedMessages(message);
    } else {
      console.log("Skipping message by user");
      console.log("--------------------------------");
    }
  }
}

async function waitForConfirmationFromStdIn() {
  const result = await prompt({
    type: "confirm",
    name: "continue",
    message: "Continue?",
  });

  if ("continue" in result && result.continue) {
    return true;
  } else {
    return false;
  }
}

main();
