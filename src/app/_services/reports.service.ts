import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Activity, Attendance, Leave, Productivity, SearchAppUsagesRequest, SearchTaskRequest, TimeLine, Timesheet } from '../reports/model/productivityModel';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('jwtToken');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    });
    return { headers: httpHeaders, withCredentials: true };
  }

  private post(endpoint: string, body: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrlDotNet}/report/${endpoint}`,
      body,
      this.getHttpOptions()
    );
  }

  getTaskReport(searchTaskRequest: SearchTaskRequest): Observable<any> {
    return this.post('getactivity', searchTaskRequest);
  }

  getTimesheet(timesheet: Timesheet): Observable<any> {
    return this.post('gettimesheet', timesheet);
  }

  getLeave(leave: Leave): Observable<any> {
    return this.post('getleaves', leave);
  }

  getActivity(activity: Activity): Observable<any> {
    return this.post('getactivity', activity);
  }

  getProductivity(productivity: Productivity): Observable<any> {
    return this.post('getproductivity', productivity);
  }

  getAttendance(attendance: Attendance): Observable<any> {
    return this.post('getattandance', attendance);
  }

  getAppUsagesReport(searchTaskRequest: SearchAppUsagesRequest): Observable<any> {
    return this.post('getappwebsite', searchTaskRequest);
  }

  getTimeline(timeline: TimeLine): Observable<any> {
    return this.post('gettimeline', timeline);
  }
}
