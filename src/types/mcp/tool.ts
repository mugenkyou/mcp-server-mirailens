import { z } from "zod";

export const NavigateTool = z.object({
  name: z.literal("mcp_mirailens_navigate"),
  description: z.literal("Navigate the active tab to a URL"),
  arguments: z.object({
    url: z.string().url(),
  }),
});

export const GoBackTool = z.object({
  name: z.literal("mcp_mirailens_go_back"),
  description: z.literal("Navigate back in history"),
  arguments: z.object({
    random_string: z.string().describe("Dummy parameter for no-parameter tools"),
  }),
});

export const GoForwardTool = z.object({
  name: z.literal("mcp_mirailens_go_forward"),
  description: z.literal("Navigate forward in history"),
  arguments: z.object({
    random_string: z.string().describe("Dummy parameter for no-parameter tools"),
  }),
});

export const SnapshotTool = z.object({
  name: z.literal("mcp_mirailens_snapshot"),
  description: z.literal("Capture an accessibility snapshot of the page"),
  arguments: z.object({
    random_string: z.string().describe("Dummy parameter for no-parameter tools"),
  }),
});

export const ClickTool = z.object({
  name: z.literal("mcp_mirailens_click"),
  description: z.literal("Click an element by selector or ARIA query"),
  arguments: z.object({
    element: z.string().min(1),
  }),
});

export const DragTool = z.object({
  name: z.literal("mcp_mirailens_drag"),
  description: z.literal("Drag an element to another element"),
  arguments: z.object({
    startElement: z.string().min(1),
    endElement: z.string().min(1),
  }),
});

export const HoverTool = z.object({
  name: z.literal("mcp_mirailens_hover"),
  description: z.literal("Hover over an element"),
  arguments: z.object({
    element: z.string().min(1),
  }),
});

export const TypeTool = z.object({
  name: z.literal("mcp_mirailens_type"),
  description: z.literal("Type text into an element"),
  arguments: z.object({
    element: z.string().min(1),
    text: z.string(),
  }),
});

export const SelectOptionTool = z.object({
  name: z.literal("mcp_mirailens_select_option"),
  description: z.literal("Select an option in a select element"),
  arguments: z.object({
    element: z.string().min(1),
    values: z.array(z.string()).min(1),
  }),
});

export const PressKeyTool = z.object({
  name: z.literal("mcp_mirailens_press_key"),
  description: z.literal("Press a keyboard key"),
  arguments: z.object({
    key: z.string().min(1),
  }),
});

export const WaitTool = z.object({
  name: z.literal("mcp_mirailens_wait"),
  description: z.literal("Wait for a number of seconds"),
  arguments: z.object({
    time: z.number().gt(0),
  }),
});

export const GetConsoleLogsTool = z.object({
  name: z.literal("mcp_mirailens_get_console_logs"),
  description: z.literal("Get recent console logs from the page"),
  arguments: z.object({
    random_string: z.string().describe("Dummy parameter for no-parameter tools"),
  }),
});

export const ScreenshotTool = z.object({
  name: z.literal("mcp_mirailens_screenshot"),
  description: z.literal("Capture a PNG screenshot of the page"),
  arguments: z.object({
    random_string: z.string().describe("Dummy parameter for no-parameter tools"),
  }),
});
