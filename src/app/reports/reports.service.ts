import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Activity, Attendance, Leave, Productivity, SearchTaskRequest, Timesheet } from './model/productivityModel';

@Injectable({ providedIn: 'root' })

export class ReportsService {
    constructor(private http: HttpClient) {
    }

  getTaskReport(searchTaskRequest: SearchTaskRequest): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/report/getactivity`, searchTaskRequest, httpOptions);
  }

  
  getTimesheet(timesheet: Timesheet): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/report/gettimesheet`, timesheet, httpOptions);
  }

  getLeave(leave: Leave): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/report/getleaves`, leave, httpOptions);
  }

  getActivity(activity: Activity): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/report/getactivity`, activity, httpOptions);
  }

  getProductivity(productivity: Productivity): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/report/getproductivity`, productivity, httpOptions);
  }

  getAttendance(attendance: Attendance): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/report/getattandance`, attendance, httpOptions);
  }
  
}

