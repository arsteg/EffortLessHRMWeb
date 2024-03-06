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

  selectedTemplate: any = new BehaviorSubject('');

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

  public getGeneralSettingsByCompany(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/leave/general-settings-by-company`, this.httpOptions);
  }

  public updateGeneralSettings(generalSettingsId: string, generalSettings: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/leave/general-settings/${generalSettingsId}`, generalSettings, this.httpOptions);
  }

  public getLeavetemplates(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/leave/leave-templates`, this.httpOptions);
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

  public updateLeaveTemplateCategories(templateId: string, categories: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/leave/leave-template-categories/${templateId}`, categories, this.httpOptions);
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

  public getLeaveTemplateAssignment(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-assignments`, this.httpOptions);
  }

  public deleteTemplateAssignment(leaveId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-assignments/${leaveId}`, this.httpOptions);
  }

  public updateTemplateAssignment(leaveId: string, leaveAssignment: any): any{
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/Leave/employee-leave-assignments/${leaveId}`, leaveAssignment ,this.httpOptions);
  }

}