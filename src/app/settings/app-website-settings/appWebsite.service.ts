 import { Injectable } from '@angular/core';
 import { Observable, of } from 'rxjs';
 import { environment } from 'src/environments/environment';
 import { HttpHeaders, HttpClient } from '@angular/common/http';
 import { AppWebsite } from './appWebsite';

@Injectable({
  providedIn: 'root'
})
export class AppWebsiteService {

  constructor(private http: HttpClient) {
  }

  getAllApplication(): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/settings/productivity/GetAll`, httpOptions);
    return response;
  }

addApplication(AppWebsite): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/settings/productivity/add`, AppWebsite, httpOptions);
  }

  deleteApplication(id) {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.delete<Task>(`${environment.apiUrlDotNet}/settings/productivity/${id}`, httpOptions);
  }

  updateApplication(id, AppWebsite): Observable<AppWebsite> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<AppWebsite>(`${environment.apiUrlDotNet}/settings/productivity/update/${id}`, AppWebsite, httpOptions);
  }
}
