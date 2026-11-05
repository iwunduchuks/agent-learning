import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import chalk from "chalk";
import { withHistory, writeMessage } from "./messages.js";

const SYSTEM_PROMPT = `You are a RESEARCHER.

Your job: investigate the question you are given and return PURE FACTS about the subject.

Rules:
- Use WebSearch and WebFetch to gather accurate, current information. Prefer authoritative sources.
- Output facts only: definitions, dates, figures, names, causes, effects, and verifiable claims.
- No opinions, speculation, filler, introductions, conclusions, or advice.
- If sources conflict or a fact is uncertain, say so briefly rather than guessing.
- Organise facts under short plain headings, one fact per line.
- HARD LIMIT: 900 words maximum. Stop before exceeding it.
- End with a "Sources" line listing the URLs you relied on.`;

export async function researcher(question: string): Promise<string> {
  let output = "";
  console.log(chalk.gray("Running [Researcher]"));

  for await (const message of query({
    prompt: withHistory(question),
    options: {
      allowedTools: ["WebSearch", "WebFetch"],
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

  writeMessage("agent", "researcher", output);
  return output;
}
