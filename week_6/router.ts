import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { withHistory, writeMessage } from "./messages.js";
import chalk from "chalk";

export const AGENT_NAMES = ["researcher", "writer", "editor"] as const;
export type AgentName = (typeof AGENT_NAMES)[number];

const SYSTEM_PROMPT = `You are a ROUTER. You read a prompt and decide which agent should handle it.

Available agents:
- researcher: researches a subject and produces pure facts (max 900 words). Choose it for questions, topics, or requests needing information gathered.
- writer: rewrites supplied material into well-structured paragraphs. Choose it when the prompt contains text/facts to be rewritten, expanded, or turned into prose.
- editor: condenses supplied text into sharp bullet points. Choose it when the prompt contains text to be summarised or bulleted.

Rules:
- Reply with ONLY the agent name: researcher, writer, or editor.
- Lowercase, no punctuation, no explanation, no extra words.
- If unsure, reply researcher.
- Do not use any tools.`;

export async function router(prompt: string): Promise<AgentName> {
  let output = "";
  console.log(chalk.gray("Running [Router]"));

  for await (const message of query({
    prompt: withHistory(prompt),
    options: {
      allowedTools: [],
      model: "claude-sonnet-4-6",
      systemPrompt: SYSTEM_PROMPT,
    },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      output = message.result;
    }
  }

  const name = output.trim().toLowerCase();
  const agent = AGENT_NAMES.find((a) => name.includes(a)) ?? "researcher";
  writeMessage("agent", "router", agent);
  return agent;
}
