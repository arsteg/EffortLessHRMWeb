import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaxationService {
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

  constructor(private http: HttpClient) { }
  public getToken() {
    return localStorage.getItem('jwtToken');
  }
  // Tax Components CRUD
  addTaxComponent(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/users/income-tax-componants`, payload, this.httpOptions);
    return response;
  }

  getTaxComponent(companyId: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/users/income-tax-componants/${companyId}`, this.httpOptions);
    return response;
  }

  getAllTaxComponents(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/users/income-tax-componants-list`, payload, this.httpOptions);
    return response;
  }

  updateTaxComponent(companyId: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/users/income-tax-componants/${companyId}`, payload, this.httpOptions);
    return response;
  }

  deleteTaxComponent(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/users/income-tax-componants/${id}`, this.httpOptions);
    return response;
  }

  // Income Tax CRUD
  addIncomeTax(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/users/employee-income-tax-declarations`, payload, this.httpOptions);
    return response;
  }

  updateIncomeTax(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/users/employee-income-tax-declarations/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteIncomeTax(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/users/employee-income-tax-declarations/${id}`, this.httpOptions);
    return response;
  }

  getIncomeTax(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/users/employee-income-tax-declarations-by-company`, payload, this.httpOptions);
    return response;
  }
}
