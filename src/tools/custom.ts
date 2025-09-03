import { zodToJsonSchema } from "zod-to-json-schema";

import { GetConsoleLogsTool, ScreenshotTool } from "./schema";

import { Tool } from "./tool";

export const getConsoleLogs: Tool = {
  schema: {
    name: GetConsoleLogsTool.shape.name.value,
    description: GetConsoleLogsTool.shape.description.value,
    inputSchema: zodToJsonSchema(GetConsoleLogsTool.shape.arguments),
  },
  handle: async (context, _params) => {
    const consoleLogs = await context.sendSocketMessage(
      "browser_get_console_logs",
      {},
    );
    const text: string = (consoleLogs as unknown[])
      .map((log: unknown) => JSON.stringify(log))
      .join("\n");
    return {
      content: [{ type: "text", text }],
    };
  },
};

export const screenshot: Tool = {
  schema: {
    name: ScreenshotTool.shape.name.value,
    description: ScreenshotTool.shape.description.value,
    inputSchema: zodToJsonSchema(ScreenshotTool.shape.arguments),
  },
  handle: async (context, _params) => {
    // Small wait to allow late resources to finish
    try {
      await context.sendSocketMessage("browser_wait", { time: 1 });
    } catch {}

    const raw = await context.sendSocketMessage(
      "browser_screenshot",
      {},
      { timeoutMs: 60000 },
    );

    // Normalize to base64 PNG and persist to disk
    const dataUrlPrefix = "data:image/png;base64,";
    const base64Png = typeof raw === "string" && raw.startsWith(dataUrlPrefix)
      ? raw.slice(dataUrlPrefix.length)
      : raw;

    // Save to screenshots folder
    let savedPath = "";
    try {
      const fs = await import("fs");
      const path = await import("path");
      const screenshotsDir = path.join(process.cwd(), "screenshots");
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");
      const filePath = path.join(screenshotsDir, `screenshot-${timestamp}.png`);
      fs.writeFileSync(filePath, Buffer.from(base64Png, "base64"));
      savedPath = filePath;
    } catch (_err) {
      // Ignore disk write errors but still return the image
    }

    const contents = [] as any[];
    if (savedPath) {
      contents.push({
        type: "text",
        text: `Saved screenshot: ${savedPath}`,
      });
    }
    contents.push({
      type: "image",
      data: base64Png,
      mimeType: "image/png",
    });

    return { content: contents };
  },
};
