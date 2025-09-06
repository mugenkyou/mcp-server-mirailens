export type MessageType<T> = keyof T;
export type MessagePayload<T, K extends keyof T> = T[K];


