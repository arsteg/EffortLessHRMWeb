import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { applicationStatus } from '../models/interviewProcess/applicationStatus';
import { BehaviorSubject } from 'rxjs';

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
  leave: any = new BehaviorSubject('')
  selectedTemplate: any = new BehaviorSubject('');
  categories: any = new BehaviorSubject('');

  constructor(private http: HttpClient) {
    super();
  }

  public getAllLeaveCategories(requestBody:any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/leave-categories-list`, requestBody, this.httpOptions);
  }

  public getLeaveCategorById(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/leave/leave-categories/${id}`, this.httpOptions);
  }

  public getLeaveCategoriesByUserv1(userId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/leave/leave-categories-by-userv1/${userId}`, this.httpOptions);
  }

  public getattendanceTemplatesByUser(userId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/attendance/attendance-templates-by-user/${userId}`, this.httpOptions);
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

  public getGeneralSettingsByCompany(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/leave/general-settings-by-company`, this.httpOptions);
  }

  public addGeneralSettings(generalSettings: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/general-settings`, generalSettings, this.httpOptions);
  }
  
  public updateGeneralSettings(generalSettingsId: string, generalSettings: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/leave/general-settings/${generalSettingsId}`, generalSettings, this.httpOptions);
  }

  public getLeavetemplates(requestBody:any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/leave-templates-list`, requestBody, this.httpOptions);
  }

  public addLeaveTemplate(leave: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/leave-templates`, leave, this.httpOptions);
  }

  public getLeaveTemplateById(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/leave/leave-templates/${id}`, this.httpOptions);
  }

  public deleteTemplate(leaveId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/leave/leave-template/${leaveId}`, this.httpOptions);
  }

  public updateLeaveTemplate(leaveId: string, template: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/leave/leave-templates/${leaveId}`, template, this.httpOptions);
  }

  public updateLeaveTemplateCategories(categories: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/leave-template-categories`, categories, this.httpOptions);
  }


  public getLeaveTemplateCategoriesByTemplateId(templateId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/leave/leave-template-categories-by-template/${templateId}`, this.httpOptions);
  }


  public addLeaveTemplateAssignment(leaveAsignment: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-assignments`, leaveAsignment, this.httpOptions);
  }

  public getLeaveTemplateAssignment(leaveTemplateAssignment: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-assignments-list`, leaveTemplateAssignment, this.httpOptions);
  }

  public getLeaveTemplateAssignmentByUser(userId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-assignments-by-user/${userId}`, this.httpOptions);
  }

  public deleteTemplateAssignment(leaveId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-assignments/${leaveId}`, this.httpOptions);
  }

  public updateTemplateAssignment(leaveId: string, leaveAssignment: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-assignments/${leaveId}`, leaveAssignment, this.httpOptions);
  }

  // leave grant
  public getLeaveGrant(requestBody): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-grant-list`, requestBody, this.httpOptions);
  }

  public getLeaveGrantByUser(userId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-grant-by-user/${userId}`, this.httpOptions);
  }

  public getLeaveGrantByTeam(requestBody): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-grant-by-team`, requestBody, this.httpOptions);

  }

  public addLeaveGrant(leaveGrant: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-grant`, leaveGrant, this.httpOptions);
  }

  public updateLeaveGrant(id: string, leaveGrant: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-grant/${id}`, leaveGrant, this.httpOptions);
  }

  public deleteLeaveGrant(leave: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-grant/${leave}`, this.httpOptions);
  }

  // leave balance

  public getLeaveBalance(leaveBalance: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/get-leave-balance`, leaveBalance, this.httpOptions);
  }

  // Leave application
  public addLeaveApplication(leaveApplication: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-application`, leaveApplication, this.httpOptions);
  }

  public getLeaveApplication(requestBody: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-application-list`, requestBody, this.httpOptions);
  }

  public getLeaveApplicationbyUser(payload: any, userId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-application-by-user/${userId}`, payload, this.httpOptions);
  }

  public getLeaveApplicationByTeam(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-application-by-team`, this.httpOptions);
  }

  public updateLeaveApplication(id: string, leaveApplication: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-application/${id}`, leaveApplication, this.httpOptions);
  }

  public deleteLeaveApplication(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-application/${id}`, this.httpOptions);
  }

  // Short Leave

  public getShortLeave(requestBody: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/all-short-leave`, requestBody, this.httpOptions);
  }

  public addShortLeave(shortLeave: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/short-leave`, shortLeave, this.httpOptions);
  }

  public updateShortLeave(id: string, shortLeave: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/leave/short-leave/${id}`, shortLeave, this.httpOptions);
  }

  public deleteShortLeave(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/leave/short-leave/${id}`, this.httpOptions);
  }

  public getAppliedLeaveCount(userId: string, requestBody:any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/employee-leave-application-by-user/${userId}`, requestBody,this.httpOptions);
  }

  public getShortLeaveByUserId(userId: string, requestBody: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/short-leave-by-user/${userId}`, requestBody, this.httpOptions);
  }
}