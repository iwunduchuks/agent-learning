require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic();

async function main() {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: "You answer only in simple words a 5-year-old understands.",
    messages: [
      {
        role: "user",
        content: "In one sentence, what is an AI agent?",
      },
    ],
  });
  console.log(msg.content[0].text);
}
main();
