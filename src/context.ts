import { WebSocket } from "ws";

const noConnectionMessage = `No connection to browser extension. In order to proceed, you must first connect a tab by clicking the MiraiLens extension icon in the browser toolbar and clicking the 'Connect' button.`;

export class Context {
  private _ws: WebSocket | undefined;

  get ws(): WebSocket {
    if (!this._ws) {
      throw new Error(noConnectionMessage);
    }
    return this._ws;
  }

  set ws(ws: WebSocket) {
    this._ws = ws;
  }

  hasWs(): boolean {
    return !!this._ws;
  }

  async sendSocketMessage(type: string, payload: any, options: { timeoutMs?: number } = { timeoutMs: 30000 }) {
    const ws = this.ws;
    const message = { type, payload };
    const timeoutMs = options.timeoutMs ?? 30000;
    return await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout waiting for response")), timeoutMs);
      const handler = (data: WebSocket.RawData) => {
        try {
          const json = JSON.parse(data.toString());
          if (json && json.type === `${type}_result`) {
            clearTimeout(timeout);
            ws.off("message", handler);
            resolve(json.data);
          }
        } catch {}
      };
      ws.on("message", handler);
      ws.send(JSON.stringify(message), (err) => {
        if (err) {
          clearTimeout(timeout);
          ws.off("message", handler);
          reject(err);
        }
      });
    });
  }

  async close() {
    if (!this._ws) {
      return;
    }
    await this._ws.close();
  }
}
