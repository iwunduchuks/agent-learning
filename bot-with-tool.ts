import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { writeFile } from "node:fs/promises";
import readline from "readline/promises";

// TOOLS -------------------------------

// getWeather
const getWeatherTool: { schema: Anthropic.Tool; run: any } = {
  schema: {
    name: "getWeather",
    description: "Get the weather for a given city",
    input_schema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The city at which you want the weather",
        },
      },
      required: ["city"],
    },
  },
  run: (input: { city: string }) => {
    return "It is 30°C and sunny in " + input.city;
  },
};

// saveNote
const saveNoteTool: { schema: Anthropic.Tool; run: any } = {
  schema: {
    name: "saveNote",
    description: "Save text to the notes.txt file in the current directory",
    input_schema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to save in notes.txt",
        },
      },
      required: ["text"],
    },
  },
  run: async (input: { text: string }) => {
    await writeFile("notes.txt", input.text, "utf8");
    return "The note was saved to notes.txt";
  },
};

const tools: { schema: Anthropic.Tool; run: any }[] = [
  getWeatherTool,
  saveNoteTool,
];

// AGENT ----------------------------

const rl = readline.createInterface(process.stdin, process.stdout);
const client = new Anthropic();
const messages: Anthropic.MessageParam[] = []; // For storage (Push to store)
const toolsSchema = tools.map((tool) => tool.schema);

let running = true;

async function ask(content: string) {
  messages.push({ role: "user", content: content });

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    tools: toolsSchema,
    system:
      "You are being accessed from the Terminal so ensure to reply in a manner acceptable in CLI terminals",
    max_tokens: 300,
    messages,
  });

  messages.push({ role: "assistant", content: msg.content });

  if (msg.stop_reason == "tool_use") {
    const toolUseBlocks = msg.content.filter((c) => c.type == "tool_use");

    for (const toolUse of toolUseBlocks) {
      const tool = tools.find((t) => t.schema.name === toolUse.name);

      if (tool) {
        const result = await tool.run(toolUse.input);
        messages.push({
          role: "user",
          content: [
            { type: "tool_result", tool_use_id: toolUse.id, content: result },
          ],
        });
      }
    }

    const followUp = await client.messages.create({
      model: "claude-sonnet-4-6",
      tools: toolsSchema,
      system:
        "You are being accessed from the Terminal so ensure to reply in a manner acceptable in CLI terminals",
      max_tokens: 300,
      messages,
    });

    const reply =
      followUp.content[0].type === "text" ? followUp.content[0].text : "";
    console.log("Claude: ", reply);
    console.log(""); // New line
  } else {
    const reply = msg.content[0].type === "text" ? msg.content[0].text : "";
    console.log("Claude hi: ", reply);
    console.log(""); // New line
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
