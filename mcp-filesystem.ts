import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import readline from "readline/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// const mcp = new Client({
//   name: "mcp-filesystem",
//   version: "1.0.0",
// });

const mcp = new Client({
  name: "mcp-quotes",
  version: "1.0.0",
});

const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "server.ts", "./"],
});

await mcp.connect(transport);
const { tools } = await mcp.listTools();

// AGENT ----------------------------

const rl = readline.createInterface(process.stdin, process.stdout);
const client = new Anthropic();
const messages: Anthropic.MessageParam[] = []; // For storage (Push to store)
const toolsSchema: Anthropic.Tool[] = tools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  input_schema: tool.inputSchema,
}));

let running = true;

async function ask(content: string) {
  messages.push({
    role: "user",
    content,
  });

  while (true) {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      tools: toolsSchema,
      system:
        "You are being accessed from the Terminal so ensure to reply in a manner acceptable in CLI terminals",
      max_tokens: 300,
      messages,
    });

    messages.push({
      role: "assistant",
      content: msg.content,
    });

    // Claude is finished
    if (msg.stop_reason !== "tool_use") {
      const reply = msg.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("");

      console.log("Claude:", reply);
      console.log("");

      break;
    }

    // Claude requested one or more tools
    const toolUseBlocks = msg.content.filter((c) => c.type === "tool_use");

    for (const toolUse of toolUseBlocks) {
      const result = await mcp.callTool({
        name: toolUse.name,
        arguments: toolUse.input as Record<string, unknown>,
      });

      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(result.content),
          },
        ],
      });
    }

    // Loop back to Claude with the tool results
  }
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
