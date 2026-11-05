import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import readline from "readline/promises";

const rl = readline.createInterface(process.stdin, process.stdout);
const question = await rl.question("You: ");

const client = new Anthropic();
const messages = []; // For storage (Push to store)
let running = true;

async function ask(content) {
  messages.push({ role: "user", content: content });

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    system:
      "You are being accessed from the Terminal so ensure to reply in a manner acceptable in CLI terminals",
    max_tokens: 300,
    messages,
  });

  const reply = msg.content[0].text; // Reply from claude
  console.log("Claude: ", reply);
  console.log("");
  messages.push({ role: "assistant", content: reply }); // store claude's reply as assistant role
}

while (running) {
  const question = await rl.question("You: ");

  switch (question.trim().toLowerCase()) {
    case "quit":
      running = false;
      break;

    default:
      await ask(question);
  }
}

rl.close();
