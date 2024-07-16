import { Storage } from "@capacitor/storage";
import { isPlatform } from "@ionic/react";
import { makeAutoObservable } from "mobx";
import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL || "";

class WebSocketStore<T> {
  socket: Socket | null = null;
  private unsentMessageQueue: { event: string; data: T }[] = [];
  private readonly namespace: string;

  constructor(namespace: string = "") {
    this.namespace = namespace;
    makeAutoObservable(this);
  }

  async initialize() {
    await this.initializeSocket();
    this.setupVisibilityChangeListener();
  }

  async initializeSocket() {
    if (this.socket) return;

    this.socket = io(`${URL}/${this.namespace}`, {
      transports: ["websocket"],
      withCredentials: true,
      extraHeaders: {
        "X-Capacitor-HTTP-Plugin": "true",
      },
      auth: isPlatform("mobile")
        ? { cookie: (await Storage.get({ key: "session_id" })).value }
        : {},
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
      setTimeout(() => this.reconnect(), 5000);
    });
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
