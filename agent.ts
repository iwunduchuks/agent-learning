// 👋 Claude was here — read the whole file, 10/10 would review again
import "dotenv/config";
import readline from "readline/promises";
import { query } from "@anthropic-ai/claude-agent-sdk";
import chalk from "chalk";

const rl = readline.createInterface(process.stdin, process.stdout);
let running = true;
let sessionId: string | undefined; // tracks the conversation so follow-up turns include prior history

while (running) {
  const question = await rl.question("You: ");

  if (question.toLowerCase() === "quit") break;

  for await (const message of query({
    prompt: question,
    options: {
      allowedTools: [
        "Read",
        "Edit",
        "Glob",
        "WebSearch",
        "WebFetch",
        "mcp__mcp-server__*",
      ],
      permissionMode: "acceptEdits", // Auto-approve file edits
      model: "claude-sonnet-4-6",
      systemPrompt:
        "You are being accessed from the Terminal so ensure to reply in a manner acceptable in CLI terminals",
      resume: sessionId, // resume the previous session so earlier messages are sent along with the new prompt
      mcpServers: {
        "mcp-server": {
          command: "npx",
          args: ["tsx", "server.ts", "./"],
          alwaysLoad: true,
        },
      },
    },
  })) {
    // Print human-readable output
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("name" in block) {
          console.log(chalk.gray(`Using tool: ${block.name}`)); // Tool being called
        }
      }
    } else if (message.type === "result" && message.subtype === "success") {
      sessionId = message.session_id;
      console.log(`Claude: ${message.result}`); // Final result
      console.log(" ");
    }
  }
}

rl.close();
