import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { Subordinate } from '../models/subordinate.Model';
import { Observable } from 'rxjs';
import { response } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
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

  HoursWorked(userId,date): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/dashboard/HoursWorked?userId=${userId}&date=${date}`, this.httpOptions);
   return response;
  }

  weeklySummary(userId,date): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/dashboard/weeklySummary?userId=${userId}&date=${date}`, this.httpOptions);
   return response;
  }
  monthlySummary(userId,date): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/dashboard/monthlySummary?userId=${userId}&date=${date}`, this.httpOptions);
   return response;
  }
  taskwiseHours(userId): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/dashboard/taskwiseHours?userId=${userId}`, this.httpOptions);
   return response;
  }
  taskwiseStatus(userId): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/dashboard/taskwiseStatus?userId=${userId}`, this.httpOptions);
   return response;
  }
  getApplicationTimeSummary(userId,date): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/dashboard/getApplicationTimeSummary?userId=${userId}&date=${date}`, this.httpOptions);
   return response;
  }

}
