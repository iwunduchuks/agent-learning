import { researcher } from "./researcher.js";
import { writer } from "./writer.js";
import { editor } from "./editor.js";
import { router } from "./router.js";
import { writeMessage } from "./messages.js";

export type Mode = "sequential" | "router";

export async function manager(question: string, mode: Mode = "sequential") {
  writeMessage("user", "user", question);
  const responses = {
    question,
    mode,
    router: "",
    researcher: "",
    writer: "",
    editor: "",
  };

  switch (mode) {
    case "sequential":
      responses.researcher = await researcher(question);
      responses.writer = await writer(responses.researcher);
      responses.editor = await editor(responses.writer);
      return { responses, result: responses.editor };
    case "router": {
      const agent = await router(question);
      responses.router = agent;
      const agents = { researcher, writer, editor };
      responses[agent] = await agents[agent](question);
      return { responses, result: responses[agent] };
    }
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}
