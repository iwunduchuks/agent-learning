require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic();

const messages = []; // For storage (Push to store)

async function ask(content) {
  messages.push({ role: "user", content: content });

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: "You answer only in simple words a 5-year-old understands.",
    messages,
  });

  const reply = msg.content[0].text; // Reply from claude
  console.log(reply);
  messages.push({ role: "assistant", content: reply }); // store claude's reply as assistant role
}

async function main() {
  await ask("In one sentence, what is an AI agent?");
  await ask("What did I just ask you?");
}

main();
