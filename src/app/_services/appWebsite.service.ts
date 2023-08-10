import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppWebsite } from '../settings/app-website-settings/appWebsite';

@Injectable({
  providedIn: 'root'
})
export class AppWebsiteService {

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    });
    const httpOptions = { headers, withCredentials: true };
    return httpOptions;
  }

  getAllApplication(): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get<any>(`${environment.apiUrlDotNet}/settings/productivity/GetAll`, httpOptions);
  }

  addApplication(appWebsite: AppWebsite): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post<any>(`${environment.apiUrlDotNet}/settings/productivity/add`, appWebsite, httpOptions);
  }

  deleteApplication(id): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.delete<any>(`${environment.apiUrlDotNet}/settings/productivity/${id}`, httpOptions);
  }

  updateApplication(id, appWebsite: AppWebsite): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post<any>(`${environment.apiUrlDotNet}/settings/productivity/update/${id}`, appWebsite, httpOptions);
  }
  getProductivityApps(userId): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get<any>(`${environment.apiUrlDotNet}/appWebsite/productivity/apps/${userId}`, httpOptions);
  }
  updateProductivityApps(userId,status:any): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.put<any>(`${environment.apiUrlDotNet}/appWebsite/productivity/${userId}`,status, httpOptions);
  }
  getBrowserHistory(startDate:any, endDate:any,userId:string,): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get<any>(`${environment.apiUrlDotNet}/appWebsite/browser-history?startDate=${startDate}&endDate=${endDate}&userId=${userId}`,httpOptions);
  }
}
