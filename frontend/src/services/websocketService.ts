export type WebSocketEvent = {
  type: string;
};

type EventListener = (event: WebSocketEvent) => void;

const defaultReconnectDelay = 3000;

function getWebSocketUrl(): string {
  const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const apiUrl = configuredApiUrl ?? "http://localhost:8080/api";
  const url = new URL(apiUrl, window.location.origin);

  if (!configuredApiUrl || configuredApiUrl.startsWith("/")) {
    url.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    url.hostname = window.location.hostname;
    url.port = window.location.port;
  } else {
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  }

  url.pathname = "/ws";
  url.search = "";
  return url.toString();
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private manuallyClosed = false;
  private readonly listeners = new Set<EventListener>();

  connect(): void {
    if (
      this.manuallyClosed ||
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    this.socket = new WebSocket(getWebSocketUrl());
    this.socket.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as WebSocketEvent;
        if (typeof event.type === "string") {
          this.listeners.forEach((listener) => listener(event));
        }
      } catch {
        // Ignore malformed events without affecting the POS.
      }
    };
    this.socket.onclose = () => {
      this.socket = null;
      this.scheduleReconnect();
    };
    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    this.connect();

    return () => {
      this.listeners.delete(listener);
    };
  }

  close(): void {
    this.manuallyClosed = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  private scheduleReconnect(): void {
    if (this.manuallyClosed || this.reconnectTimer !== null) {
      return;
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.listeners.size > 0) {
        this.connect();
      }
    }, defaultReconnectDelay);
  }
}

export const websocketService = new WebSocketService();
