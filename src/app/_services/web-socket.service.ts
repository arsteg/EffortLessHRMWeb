// src/app/_services/web-socket.service.ts
import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
import { WebSocketNotification } from 'src/app/models/eventNotification/eventNotitication';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<WebSocketNotification> | null = null;
  private messagesSubject = new Subject<WebSocketNotification>();
  public messages$: Observable<WebSocketNotification> = this.messagesSubject.asObservable();

  private readonly SOCKET_URL = environment.webSocketUrl;

  connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket<WebSocketNotification>(this.SOCKET_URL);
      
      this.socket$.subscribe({
        next: (message) => this.messagesSubject.next(message),
        error: (err) => console.error('WebSocket error:', err),
        complete: () => console.log('WebSocket connection closed')
      });
    }
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }
}
