import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { applicationStatus } from '../models/interviewProcess/applicationStatus';

@Injectable({
  providedIn: 'root'
})
export class LeaveService extends baseService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {
    super();
  }

  public getAllLeaveCategories(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/leave/leave-categories`, this.httpOptions);
  }

  public addLeaveCategory(leave: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/leave-categories`, leave, this.httpOptions);
  }

  public updateLeaveCategory(leaveId: string, leaveCategory: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/leave/leave-categories/${leaveId}`, leaveCategory, this.httpOptions);
  }

  public deleteLeaveCategory(leave: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/leave/leave-categories/${leave}`, this.httpOptions);
  }
}

