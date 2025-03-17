// src/app/_services/web-socket.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// Enums for notification and content types
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

// Interface for WebSocket messages
export interface WebSocketMessage {
  notificationType: WebSocketNotificationType;
  contentType: WebSocketContentType;
  content: string;
  timestamp: string;
}

// src/app/_services/web-socket.service.ts
@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private socket$: WebSocketSubject<WebSocketMessage> | null = null;
  private messagesSubject = new BehaviorSubject<WebSocketMessage | null>(null);
  private readonly SOCKET_URL = environment.webSocketUrl;
  private userId: string | null = null;

  constructor() {
    window.addEventListener('beforeunload', () => this.disconnect());
  }

  connect(userId: string): void {
    if (this.isConnected()) {
      if (this.userId === userId) {
        console.log(`Already connected as user ${userId}`);
        return;
      }
      this.disconnect();
    }

    this.userId = userId;
    this.socket$ = webSocket<WebSocketMessage>(this.SOCKET_URL);
    console.log(`Connecting WebSocket for user ${userId}`);

    this.socket$.next({ type: 'auth', userId } as any);

    this.socket$.subscribe({
      next: (message) => {
        console.log(`Received message for user ${userId}:`, message);
        this.messagesSubject.next(message);
      },
      error: (err) => console.error(`WebSocket error for user ${userId}:`, err),
      complete: () => console.log(`WebSocket connection closed for user ${userId}`)
    });
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
      this.userId = null;
      this.messagesSubject.next(null);
      console.log('WebSocket disconnected');
    }
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
      console.error('WebSocket is not connected');
    }
  }

  isConnected(): boolean {
    return !!this.socket$ && !this.socket$.closed;
  }

  getUserId(): string | null {
    return this.userId;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}