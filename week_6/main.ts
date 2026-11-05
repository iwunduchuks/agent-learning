import "dotenv/config";
import readline from "readline/promises";
import { manager } from "./manager.js";

const rl = readline.createInterface(process.stdin, process.stdout);

while (true) {
  const question = await rl.question("You: ");

  if (question.toLowerCase() === "quit") break;

  const { responses, result } = await manager(question, "router");
  console.log("Claude: ", result);
  // console.log(responses);
  console.log(" ");
}

rl.close();
