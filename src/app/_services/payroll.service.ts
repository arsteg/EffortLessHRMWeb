import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PayrollService {
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

  data: any = new BehaviorSubject('');
  addResponse: any = new BehaviorSubject('');
  generalSettings: any = new BehaviorSubject('');

  constructor(private http: HttpClient) { }
  public getToken() {
    return localStorage.getItem('jwtToken');
  }

  // general settings CRUD
  addGeneralSettings(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/general-settings`, payload, this.httpOptions);
    return response;
  }

  getGeneralSettings(companyId: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/general-settings/${companyId}`, this.httpOptions);
    return response;
  }

  updateGeneralSettings(companyId: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/general-settings/${companyId}`, payload, this.httpOptions);
    return response;
  }

  // Rounding Rules CRUD
  addRoundingRules(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/rounding-rules`, payload, this.httpOptions);
    return response;
  }

  updateRoundingRules(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/rounding-rules/${id}`, payload, this.httpOptions);
    return response;
  }

  getRoundingRules(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/rounding-rules-list`, payload, this.httpOptions);
    return response;
  }

  deleteRoundingRules(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/rounding-rules/${id}`, this.httpOptions);
    return response;
  }
  
  // Fixed Allowance CRUD
  getFixedAllowance(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-allowances-list`, payload, this.httpOptions);
    return response;
  }


}
