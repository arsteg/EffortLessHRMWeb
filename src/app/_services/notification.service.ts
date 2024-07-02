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
  getNotificationsTypeById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/eventNotifications/eventNotificationType/${id}`, this.httpOptions);
    return response;
  }

  deleteEventNotification(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/eventNotifications/${id}`, this.httpOptions);
    return response;
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
