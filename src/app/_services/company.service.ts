import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
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
  // band Crud

  addBand(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/bands`, payload, this.httpOptions);
  }
  updateBand(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company/bands/${id}`, payload, this.httpOptions);
  }

  deleteBand(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/company/bands/${id}`, this.httpOptions);
  }
  getBand(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/bands-by-company`, this.httpOptions);
  }
  // Zone Crud
  addZone(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/zones`, payload, this.httpOptions);
  }
  updateZone(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company/zones/${id}`, payload, this.httpOptions);
  }
  getZones(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/zones`, this.httpOptions);
  }
  deleteZone(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/company/zones/${id}`, this.httpOptions);
  }

  // sub departments Crud

  addSubDepartments(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/subDepartments`, payload, this.httpOptions);
  }

  updateSubDepartments(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company/subDepartments/${id}`, payload, this.httpOptions);
  }

  deleteSubDepartments(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/company/subDepartments/${id}`, this.httpOptions);
  }

  getSubDepartments(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/subDepartments`, this.httpOptions);
  }
  getCompany(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company`, this.httpOptions);
  }

  updateCompany(payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company`, payload, this.httpOptions);
  }

  updateCompanyLogo(payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company/update-company-logo`, payload, this.httpOptions);
  }

  // departments Crud
  addDepartments(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/departments`, payload, this.httpOptions);
  }

  updateDepartments(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company/departments/${id}`, payload, this.httpOptions);
  }

  deleteDepartments(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/company/departments/${id}`, this.httpOptions);
  }

  getDepartments(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/departments-by-company`, this.httpOptions);
  }

  // designation Crud
  getDesignations(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/designations-by-company`, this.httpOptions);
  }

  addDesignations(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/designations`, payload, this.httpOptions);
  }

  updateDesignations(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company/designations/${id}`, payload, this.httpOptions);
  }

  deleteDesignations(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/company/designations/${id}`, this.httpOptions);
  }

  // location Crud
  getLocations(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/attendance/offices`, this.httpOptions);
  }
  addLocation(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/attendance/offices`, payload, this.httpOptions);
  }
  updateLocation(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/attendance/offices/${id}`, payload, this.httpOptions);
  }
  deleteLocation(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/attendance/offices/${id}`, this.httpOptions);
  }

  // Signatory Details Crud

  getSignatoryDetails(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/signatories-by-company`, this.httpOptions);
  }

  addSignatoryDetails(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/signatories`, payload, this.httpOptions);
  }

  updateSignatoryDetails(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company/signatories/${id}`, payload, this.httpOptions);
  }

  deleteSignatoryDetails(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/company/signatories/${id}`, this.httpOptions);
  }

  // Holidays Crud

  getHolidays(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/holiday-by-year`, payload, this.httpOptions);
  }

  addHolidays(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/holiday`, payload, this.httpOptions);
  }

  updateHolidays(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company/holiday/${id}`, payload, this.httpOptions);
  }

  deleteHolidays(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/company/holiday/${id}`, this.httpOptions);
  }

  // Tax Slab CRUD
  getTaxSlabByYear(cycle: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/tax-slabs-by-cycle/${cycle}`, this.httpOptions);
  }

  getTaxSlabByCompany(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/tax-slabs-by-company`, payload, this.httpOptions);
  }

  getTaxSlabById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/tax-slabs/${id}`, this.httpOptions);
  }

  addTaxSlab(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/company/tax-slabs`, payload, this.httpOptions);
  }

  updateTaxSlab(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/company/tax-slabs/${id}`, payload, this.httpOptions);
  }

  deleteTaxSlab(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/company/tax-slabs/${id}`, this.httpOptions);
  }
  getCompanies(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/All`, this.httpOptions);
  }
}