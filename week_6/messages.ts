import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export type Message = {
  role: "user" | "agent";
  name: string;
  content: string;
  timestamp: string;
};

const MESSAGES_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "messages.json",
);

export function readMessages(): Message[] {
  if (!fs.existsSync(MESSAGES_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8")) as Message[];
  } catch {
    return [];
  }
}

export function writeMessage(
  role: Message["role"],
  name: string,
  content: string,
): void {
  const messages = readMessages();
  messages.push({ role, name, content, timestamp: new Date().toISOString() });
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Builds a prompt that carries the full message array plus the current task
export function withHistory(task: string): string {
  const messages = readMessages();
  return `Message history (JSON array, oldest first):\n${JSON.stringify(messages, null, 2)}\n\nCurrent task:\n${task}`;
}
