// log.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { baseService } from './base';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LogService extends baseService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }),
    withCredentials: true
  };
  private socket: Socket;

  constructor(private http: HttpClient) {
    super();
    // Connect to the WebSocket server
    this.socket = io(environment.webSocketUrl); // Replace with your backend URL
    
    // this.socket = io(environment.webSocketUrl, {
    //   transports: ['websocket'], // Force WebSocket transport
    //   withCredentials: true, // Include credentials (if needed)
    // });

    this.socket.on('connect', () => {
      console.error('Connection success');
      //this.socket.emit('message', '62dfa8d13babb9ac2072863c'); // Send user ID or any initial message
    });
  
    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });
  
    this.socket.on('disconnect', () => { 
      console.log('Disconnected from WebSocket server');
    });
  }

  // Listen for log events for a specific user
  listenForLogs(userId: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(`log-${userId}`, (log) => {
        observer.next(log);
      });
      this.socket.on('error', (err: any) => {
        observer.error(err);
      });

      return () => {
        this.socket.off(userId);
      };
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  // Clean up the socket connection
  disconnect() {
    this.socket.disconnect();
  }

  public setSelectedUser(user: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/common/setSelectedUser`, user, this.httpOptions);
  }

  public getLogForloggedInUser(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/common/testlog`, this.httpOptions);
  }
}