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
  fixedAllowance: any = new BehaviorSubject('');

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
  // PF templates CRUD
  addPFTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pf-templates`, payload, this.httpOptions);
    return response;
  }
  getPfTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pf-templates-list`, payload, this.httpOptions);
    return response;
  }
  updatePFTemplate(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/pf-templates/${id}`, payload, this.httpOptions);
    return response;
  }
  deletePFTemplate(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/pf-templates/${id}`, this.httpOptions);
    return response;
  }
  // Gratuity Templates CRUD
  addGratuityTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/gratuity-templates`, payload, this.httpOptions);
    return response;
  }
  updateGratuityTemplate(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/gratuity-templates/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteGrauityTemplate(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/gratuity-templates/${id}`, this.httpOptions);
    return response;
  }
  getGratuityTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/gratuity-templates-list`, payload, this.httpOptions);
    return response;
  }
  // Fixed Allowance Templates CRUD
  addAllowanceTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-allowances`, payload, this.httpOptions);
    return response;
  }
  updateAllowanceTemplate(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/fixed-allowances/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteAllowanceTemplate(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/fixed-allowances/${id}`, this.httpOptions);
    return response;
  }
  getFixedAllowance(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-allowances-list`, payload, this.httpOptions);
    return response;
  }
  // fixed contribution
  addFixedContribution(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-contribution`, payload, this.httpOptions);
    return response;
  }
  updateFixedContribution(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/fixed-contribution/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteFixedContribution(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/fixed-contribution/${id}`, this.httpOptions);
    return response;
  }
  getFixedContribution(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-contribution-list`, payload, this.httpOptions);
    return response;
  }

  // PT-Slab Crud
  addPTSlab(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pt-slabs`, payload, this.httpOptions);
    return response;
  }
  updatePTSlab(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/pt-slabs/${id}`, payload, this.httpOptions);
    return response;
  }
  deletePTSlab(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/pt-slabs/${id}`, this.httpOptions);
    return response;
  }
  getPTSlab(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pt-slabs-list`, payload, this.httpOptions);
    return response;
  }
}