const tmi = require("tmi.js");

const client = new tmi.client({
  channels: ["alveussanctuary", "alveusgg"],
});
client.on("message", (channel, tags, msg, isSelf) => {
  if (isSelf) {
    return;
  }

  const isCommand = msg.trim().startsWith("!");
  const isPrivileged = tags.mod || tags.badges?.broadcaster === "1";

  if (isCommand && isPrivileged) {
    const [commandKey, ...commandExtras] = msg.trim().split(" ");
    const commandExtra = commandExtras.join(" ");

    switch (commandKey) {
      case "!notification":
        console.log(`* Notification: ${commandExtra}`);
        break;
      case "!settitle":
        console.log(`* Set title to ${commandExtra}`);
        break;
      case "!setgame":
        console.log(`* Set category to ${commandExtra}`);
        break;
      default:
        if (commandKey.includes("cam")) {
          console.log(`* Set cam to ${commandKey}`);
        } else {
          console.log(`* Unknown command ${commandKey}`);
        }
    }
  }
});
client.on("connected", (addr, port) => {
  console.log(`* Connected to ${addr}:${port}`);
});

client.connect();
