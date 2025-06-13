// src/app/_services/web-socket.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export enum WebSocketNotificationType {
  LOG = 'log',
  ALERT = 'alert',
  NOTIFICATION = 'notification',
  SCREENSHOT = 'screenshot',
  CHAT = 'chat'
}

export enum WebSocketContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
  JSON = 'json'
}

export interface WebSocketMessage {
  notificationType: WebSocketNotificationType;
  contentType: WebSocketContentType;
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private socket$: WebSocketSubject<WebSocketMessage> | null = null;
  private messagesSubject = new BehaviorSubject<WebSocketMessage | null>(null);
  private readonly SOCKET_URL = environment.webSocketUrl;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 100;

  constructor() {
    window.addEventListener('beforeunload', () => this.disconnect());
  }

  connect(userId: string): void {
    if (this.isConnected()) {
      if (this.userId === userId) {
        return;
      }
      this.disconnect();
    }

    this.userId = userId;
    this.socket$ = webSocket<WebSocketMessage>(this.SOCKET_URL);

    this.socket$.next({ type: 'auth', userId } as any);

    this.socket$.subscribe({
      next: (message) => {
        this.messagesSubject.next(message);
      },
      //error: (err) => console.error(`WebSocket error for user ${userId}:`, err),
      error: (err) => this.handleSocketError(err),
      complete: () => console.log(`WebSocket connection closed for user ${userId}`)
    });
  }

  disconnect(): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.complete();
    }
    this.socket$ = null;
    this.userId = null;
    this.messagesSubject.next(null);
  }

  getMessagesByType(type: WebSocketNotificationType): Observable<WebSocketMessage> {
    return this.messagesSubject.asObservable().pipe(
      filter((message): message is WebSocketMessage => !!message && message.notificationType === type),
      map(message => message)
    );
  }

  sendMessage(message: WebSocketMessage): void {
    if (this.isConnected()) {
      this.socket$!.next(message);
    } else {
    }
  }

  isConnected(): boolean {
    // Check if socket exists and isn't closed
    return this.socket$ !== null && this.socket$ !== undefined && !this.socket$.closed;
  }

  getUserId(): string | null {
    return this.userId;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private handleSocketError(err: any) {
    console.error(`WebSocket error for user ${this.userId}:`, err);

    this.socket$?.complete();
    this.socket$ = null;

    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const retryDelay = 100 * this.reconnectAttempts; // exponential backoff
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        if (this.userId) {
          this.connect(this.userId);
        }
      }, retryDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
}