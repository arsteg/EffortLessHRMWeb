// src/app/_services/web-socket.service.ts
import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
import { WebSocketNotification } from 'src/app/models/eventNotification/eventNotitication';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$: WebSocketSubject<WebSocketNotification> | null = null;
  private messagesSubject = new Subject<WebSocketNotification>();
  public messages$: Observable<WebSocketNotification> = this.messagesSubject.asObservable();

  private readonly SOCKET_URL = environment.webSocketUrl;

  constructor() {
    this.connect(); // Automatically connect when the service is instantiated
  }

  // Connect to the WebSocket server
  connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      // Create a WebSocket connection
      this.socket$ = webSocket<WebSocketNotification>(this.SOCKET_URL);

      // Subscribe to incoming messages
      this.socket$.subscribe({
        next: (message) => this.messagesSubject.next(message), // Emit the message to subscribers
        error: (err) => console.error('WebSocket error:', err), // Handle errors
        complete: () => console.log('WebSocket connection closed'), // Handle connection closure
      });
    }
  }

  // Disconnect from the WebSocket server
  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete(); // Close the WebSocket connection
      this.socket$ = null;
    }
  }

  // Send a message to the WebSocket server (if needed)
  sendMessage(message: WebSocketNotification): void {
    if (this.socket$) {
      this.socket$.next(message); // Send the message
    } else {
      console.error('WebSocket connection is not open.');
    }
  }
}