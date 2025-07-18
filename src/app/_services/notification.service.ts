import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
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

  constructor(private toastr: ToastrService, private http: HttpClient) { }
  

  public getToken() {
    return localStorage.getItem('jwtToken');
  }

  getNotificationsofToday(): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/eventNotifications/today`, this.httpOptions);
    return response;
  }

  getAllNotificationsofLoggedInUser(): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/eventNotifications/All`, this.httpOptions);
    return response;
  }
  getEventNotificationsByUser(id:string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/eventNotifications/user/${id}/notifications`, this.httpOptions);
    return response;
  }
  getNotificationsTypeById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/eventNotifications/eventNotificationType/${id}`, this.httpOptions);
    return response;
  } 
  
  deleteEventNotification(userId: string, notificationId: string): Observable<any> {
    const body = { userId: userId, notificationId: notificationId };
    return this.http.delete<any>(
        `${environment.apiUrlDotNet}/eventNotifications/user/notification`, { ...this.httpOptions,body: body}
    );
  }

  updateNotificationStatus(userId: string, notificationId: string, status: string): Observable<any> {
    const body = { userId, notificationId, status };
    return this.http.patch<any>(
      `${environment.apiUrlDotNet}/eventNotifications/user/notification/updatestatus`, body, this.httpOptions);
  }

  // ----------------
  showSuccess(message, title){
      this.toastr.success(message, title)
  }

  showError(message, title){
      this.toastr.error(message, title)
  }

  showInfo(message, title){
      this.toastr.info(message, title)
  }

  showWarning(message, title){
      this.toastr.warning(message, title)
  }
}
