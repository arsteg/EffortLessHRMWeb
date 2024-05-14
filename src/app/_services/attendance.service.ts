import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { response } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
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

  selectedTemplate: any = new BehaviorSubject('');

  constructor(private http: HttpClient) {
  }

  public getToken() {
    return localStorage.getItem('jwtToken');
  }

  addGeneralSettings(generalSettingForm: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/general-settings`, generalSettingForm, this.httpOptions);
    return response;
  }

  updateGeneralSettings(id: string, generalSettingForm: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/general-settings/${id}`, generalSettingForm, this.httpOptions);
    return response;
  }

  getGeneralSettings(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/general-settings-by-company`, this.httpOptions);
    return response;
  }

  addRegularizationReason(regularizationReason: any) {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-reasons`, regularizationReason, this.httpOptions);
    return response;
  }

  updateRegularizationReason(id: string, regularizationReason: any) {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-reasons/${id}`, regularizationReason, this.httpOptions);
    return response;
  }

  getRegularizationReason(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-reasons`, this.httpOptions);
    return response;
  }

  deleteReason(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-reasons/${id}`, this.httpOptions);
    return response;
  }

  addDutyReason(dutyReason: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/duty-reasons`, dutyReason, this.httpOptions);
    return response;
  }
  getDutyReason(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/duty-reasons`, this.httpOptions);
    return response;
  }

  updateDutyReason(id: string, dutyReason: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/duty-reasons/${id}`, dutyReason, this.httpOptions);
    return response;
  }
  deleteDutyReason(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/duty-reasons/${id}`, this.httpOptions);
    return response;
  }

  getAttendanceTemplate(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates`, this.httpOptions);
    return response;
  }

  addAttendanceTemplate(templates: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates`, templates, this.httpOptions);
    return response;
  }

  updateAttendanceTemplate(id: string, templates: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates/${id}`, templates, this.httpOptions);
    return response;
  }

  deleteAttendanceTemplate(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates/${id}`, this.httpOptions);
    return response;
  }

  getAttendanceTemplateById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates/${id}`, this.httpOptions);
    return response;
  }

}
