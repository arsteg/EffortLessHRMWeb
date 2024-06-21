import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { response } from '../models/response';
import { Observable } from 'rxjs';
import { UserNotification, eventNotification, eventNotificationType, updateUserNotification } from '../models/eventNotification/eventNotitication';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class EventNotificationService {
  private readonly token = this.getToken();
  private readonly apiUrl = environment.apiUrlDotNet;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${this.token}`
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {
  }

  public getToken() {
    return localStorage.getItem('jwtToken');
  }
 //Notification Type
  getAlleventNotificationTypes(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/eventNotifications/eventNotificationTypes`, this.httpOptions);
    return response;
  }
  addEventNotificationType(notificationType: eventNotificationType): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/eventNotifications/eventNotificationTypes`, notificationType, this.httpOptions);
    return response;
  }
  updateEventNotificationType(notificationType: eventNotificationType, id:string): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/eventNotifications/eventNotificationTypes/${id}`, notificationType, this.httpOptions);
    return response;
  }
  deleteEventNotificationType(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/eventNotifications/eventNotificationTypes/${id}`, this.httpOptions);
    return response;
  }

  //Notification
  getAllEventNotifications(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/eventNotifications/Notification`, this.httpOptions);
    return response;
  }
  addEventNotification(notificationType: eventNotification): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/eventNotifications/Notification`, notificationType, this.httpOptions);
    return response;
  }
  updateEventNotification(notificationType: eventNotification, id:string): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/eventNotifications/Notification/${id}`, notificationType, this.httpOptions);
    return response;
  }
  deleteEventNotification(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/eventNotifications/Notification/${id}`, this.httpOptions);
    return response;
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`);
  }

  getUserNotifications(userId: string): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(`${this.apiUrl}/users/${userId}/notifications`);
  }
  getNotificationUsers(notificationId: string): any {
    return this.http.get<any>(`${this.apiUrl}/eventNotifications/userNotifications/notification/${notificationId}`);
  }
  updateUserNotifications(userNotification:updateUserNotification): Observable<any> {
    return this.http.post(`${this.apiUrl}/eventNotifications/userNotifications/update`, userNotification,this.httpOptions);
  }
}
