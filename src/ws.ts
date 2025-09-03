import { WebSocketServer } from "ws";

const mcpConfig = { defaultWsPort: 29100 };
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

import { isPortInUse, killProcessOnPort } from "@/utils/port";

export async function createWebSocketServer(
  port: number = mcpConfig.defaultWsPort,
): Promise<WebSocketServer> {
  killProcessOnPort(port);
  // Wait until the port is free
  while (await isPortInUse(port)) {
    await wait(100);
  }
  return new WebSocketServer({ port });
}
