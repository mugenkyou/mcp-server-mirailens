import { WebSocket } from "ws";

export interface SocketMessageSender<T> {
  sendSocketMessage<K extends keyof T>(
    type: K,
    payload: T[K],
    options?: { timeoutMs?: number }
  ): Promise<any>;
}

export function createSocketMessageSender<T>(
  ws: WebSocket
): SocketMessageSender<T> {
  return {
    async sendSocketMessage<K extends keyof T>(
      type: K,
      payload: T[K],
      options: { timeoutMs?: number } = { timeoutMs: 30000 }
    ): Promise<any> {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Request timeout"));
        }, options.timeoutMs);

        const messageId = Math.random().toString(36).substr(2, 9);
        
        const message = {
          id: messageId,
          type,
          payload,
        };

        const handleMessage = (data: any) => {
          try {
            const response = JSON.parse(data.toString());
            if (response.id === messageId) {
              clearTimeout(timeout);
              ws.off('message', handleMessage);
              if (response.error) {
                reject(new Error(response.error));
              } else {
                resolve(response.result);
              }
            }
          } catch (e) {
            // Ignore malformed messages
          }
        };

        ws.on('message', handleMessage);
        ws.send(JSON.stringify(message));
      });
    },
  };
}


