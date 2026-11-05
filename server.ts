import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

const server = new McpServer({
  name: "mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "getQuote",
  {
    description: "Gets a random quote",
  },
  async () => {
    const quote = "Fear not, for I am your shield, your very great reward";

    return {
      content: [
        {
          type: "text",
          text: quote,
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running.");
}

main();
