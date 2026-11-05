import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import chalk from "chalk";
import { withHistory, writeMessage } from "./messages.js";

const SYSTEM_PROMPT = `You are an EDITOR.

Your job: condense the text you are given into sharp, scannable bullet points.

Rules:
- Use ONLY information in the provided text. Do not add or change facts.
- Each bullet is one idea, one line, starting with a strong keyword or fact. Cut filler and repetition.
- Group bullets under a few short bold headings when it helps scanning.
- Keep numbers, dates, and names exact.
- Output is formatted for a CLI terminal: use "-" bullets, no tables, no preamble, no closing remarks.
- Do not use any tools.`;

export async function editor(text: string): Promise<string> {
  let output = "";
  console.log(chalk.gray("Running [Editor]"));

  for await (const message of query({
    prompt: withHistory(`Turn the following text into sharp bullet points:\n\n${text}`),
    options: {
      allowedTools: [],
      model: "claude-sonnet-4-6",
      systemPrompt: SYSTEM_PROMPT,
    },
  })) {
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("name" in block) {
          console.log(chalk.gray(`[researcher] Using tool: ${block.name}`));
        }
      }
    } else if (message.type === "result" && message.subtype === "success") {
      output = message.result;
    }
  }

  writeMessage("agent", "editor", output);
  return output;
}
