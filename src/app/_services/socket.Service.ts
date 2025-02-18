import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor(private socket: Socket) {}

  // Register the user with their user ID
  registerUser(userId: string): void {
    this.socket.emit('register', userId);
  }

  // Emit user event to send user details
  emitUser(user: User): void {
    this.socket.emit('add-user', user);
  }

  // Emit exit event
  emitExit(): void {
    this.socket.emit('exit');
  }

  // Get the user ID assigned by the server
  getClientId(): Observable<string> {
    return this.socket.fromEvent('user-id');
  }

  // Get the list of users online
  getUsersOnline(): Observable<any> {
    return this.socket.fromEvent<User[], string>('users-online');
  }

  // Get the list of users online
  getImageOnline(): Observable<any> {
    return this.socket.fromEvent<User[], string>('liveImage');
  }
}
