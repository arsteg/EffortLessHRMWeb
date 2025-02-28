// log.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private socket: Socket;

  constructor() {
    // Connect to the WebSocket server
    this.socket = io(environment.webSocketUrl); // Replace with your backend URL
  }

  // Listen for log events for a specific user
  listenForLogs(userId: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(`log-${userId}`, (log) => {
        observer.next(log);
      });
    });
  }
  // Clean up the socket connection
  disconnect() {
    this.socket.disconnect();
  }
}