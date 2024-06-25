import { makeAutoObservable } from "mobx";
import { io, Socket } from "socket.io-client";

import { tryRefreshToken } from "~/api/fetch";
import { getAccessToken } from "~/utils/cookies";

const URL = import.meta.env.VITE_API_URL || "";

class WebSocketStore<T> {
  socket: Socket | null = null;
  accessToken: string | undefined = undefined;
  private unsentMessageQueue: { event: string; data: T }[] = [];
  private readonly namespace: string;

  constructor(namespace: string = "") {
    this.namespace = namespace;
    makeAutoObservable(this);
    this.initialize();
  }

  async initialize() {
    this.accessToken = getAccessToken();
    if (!this.accessToken) {
      await this.refreshAccessToken();
    }
    this.initializeSocket();
    this.setupVisibilityChangeListener();
  }

  initializeSocket() {
    if (this.socket || !this.accessToken) return;

    this.socket = io(`${URL}/${this.namespace}`, {
      transports: ["websocket"],
      extraHeaders: {
        "X-Capacitor-HTTP-Plugin": "true",
      },
      auth: { token: this.accessToken },
    });

    this.socket.on("connect", () => {
      console.log(`Connected to ${this.namespace} WebSocket server`);
      this.unsentMessageQueue.forEach((msg) =>
        this.socket?.emit(msg.event, msg.data),
      );
      this.unsentMessageQueue = [];
    });

    this.socket.on("disconnect", () => {
      console.log(`Disconnected from ${this.namespace} WebSocket server`);
      this.reconnect();
    });

    this.socket.on("connect_error", (err) => {
      console.log(
        `Connection to WebSocket ${this.namespace} error: ${err.message}`,
      );
      this.socket?.disconnect();
      setTimeout(() => this.refreshAccessToken(), 5000);
    });
  }

  async refreshAccessToken() {
    try {
      const newAccessToken = await tryRefreshToken();
      if (newAccessToken) {
        this.accessToken = newAccessToken;
        this.reconnect();
      } else {
        console.error("Failed to refresh access token");
        this.socket?.disconnect();
      }
    } catch (error) {
      console.error("Error refreshing access token:", error);
      this.socket?.disconnect();
    }
  }

  async sendMessage(event: string, data: T) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      this.unsentMessageQueue.push({ event, data });
    }
  }

  reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.initializeSocket();
    }
  }

  setupVisibilityChangeListener() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && this.socket?.disconnected) {
        this.reconnect();
      }
    });
  }
}

export const websocketUserLocation = new WebSocketStore("user-location");

export interface ISendMessageData {
  userId: string;
  content: string;
  conversationId: number;
}
export const websocketChat = new WebSocketStore<ISendMessageData>("chat");
