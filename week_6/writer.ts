import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import chalk from "chalk";
import { withHistory, writeMessage } from "./messages.js";

const SYSTEM_PROMPT = `You are a WRITER.

Your job: take the raw material you are given and rewrite it as clear, flowing prose.

Rules:
- Use ONLY the information provided. Do not add, invent, or alter any facts, figures, or names.
- Organise the content into well-structured paragraphs, each covering one idea, with logical transitions.
- Open with a short paragraph that frames the subject; close with a brief paragraph that ties it together.
- Use a clear, engaging, professional tone. No bullet points, no headings lists, no meta commentary.
- Do not use any tools. Return only the finished text.`;

export async function writer(facts: string): Promise<string> {
  let output = "";
  console.log(chalk.gray("Running [Writer]"));

  for await (const message of query({
    prompt: withHistory(`Rewrite the following facts into well-organised paragraphs:\n\n${facts}`),
    options: {
      allowedTools: [],
      model: "claude-sonnet-4-6",
      systemPrompt: SYSTEM_PROMPT,
    },
  })) {
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("name" in block) {
          console.log(chalk.gray(`[writer] Using tool: ${block.name}`));
        }
      }
    } else if (message.type === "result" && message.subtype === "success") {
      output = message.result;
    }
  }

  writeMessage("agent", "writer", output);
  return output;
}
