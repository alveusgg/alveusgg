import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const token = process.env.TOKEN;
const accountId = process.env.ACCOUNT_ID;
const queueId = process.env.DEAD_LETTER_QUEUE_ID;

async function getDeadLetterMessagesBatch(size: number) {
  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/queues/${queueId}/messages/pull`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ visibility_timeout_ms: 10000, batch_size: size }),
    },
  );
  const data = await resp.json();
  return data;
}

async function main() {
  const total = 200;
  const size = 100;

  await mkdir(join(__dirname, `../.scratchpad/dead-letters`), {
    recursive: true,
  });

  const batches = Math.ceil(total / size);
  for (let i = 0; i < batches; i++) {
    const batch = await getDeadLetterMessagesBatch(size);
    writeFile(
      join(__dirname, `../.scratchpad/dead-letters/dead-letter-${i}.json`),
      JSON.stringify(batch, null, 2),
    );
  }
}

main();
