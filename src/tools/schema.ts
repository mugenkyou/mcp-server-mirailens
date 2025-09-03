import { z } from "zod";

export const NavigateTool = z.object({
  name: z.literal("navigate"),
  description: z.literal("Navigate the active tab to a URL"),
  arguments: z.object({ url: z.string().url() }),
});

export const GoBackTool = z.object({
  name: z.literal("go_back"),
  description: z.literal("Navigate back in history"),
  arguments: z.object({}).default({}),
});

export const GoForwardTool = z.object({
  name: z.literal("go_forward"),
  description: z.literal("Navigate forward in history"),
  arguments: z.object({}).default({}),
});

export const WaitTool = z.object({
  name: z.literal("wait"),
  description: z.literal("Wait for a number of seconds"),
  arguments: z.object({ time: z.number().int().positive() }),
});

export const PressKeyTool = z.object({
  name: z.literal("press_key"),
  description: z.literal("Press a keyboard key"),
  arguments: z.object({ key: z.string().min(1) }),
});

export const SnapshotTool = z.object({
  name: z.literal("snapshot"),
  description: z.literal("Capture an accessibility snapshot of the page"),
  arguments: z.object({}).default({}),
});

export const ClickTool = z.object({
  name: z.literal("click"),
  description: z.literal("Click an element by selector or ARIA query"),
  arguments: z.object({ element: z.string().min(1) }),
});

export const DragTool = z.object({
  name: z.literal("drag"),
  description: z.literal("Drag from one element to another"),
  arguments: z.object({ startElement: z.string().min(1), endElement: z.string().min(1) }),
});

export const HoverTool = z.object({
  name: z.literal("hover"),
  description: z.literal("Hover over an element"),
  arguments: z.object({ element: z.string().min(1) }),
});

export const TypeTool = z.object({
  name: z.literal("type"),
  description: z.literal("Type text into an element"),
  arguments: z.object({ element: z.string().min(1), text: z.string() }),
});

export const SelectOptionTool = z.object({
  name: z.literal("select_option"),
  description: z.literal("Select an option in a select element"),
  arguments: z.object({ element: z.string().min(1), values: z.array(z.string()).min(1) }),
});

export const GetConsoleLogsTool = z.object({
  name: z.literal("get_console_logs"),
  description: z.literal("Get recent console logs from the page"),
  arguments: z.object({}).default({}),
});

export const ScreenshotTool = z.object({
  name: z.literal("screenshot"),
  description: z.literal("Capture a PNG screenshot of the page"),
  arguments: z.object({}).default({}),
});





