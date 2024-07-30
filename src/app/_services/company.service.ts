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
  getBand(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/bands-by-company`, this.httpOptions);
  }
  getZones(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/zones`, this.httpOptions);
  }
  getSubDepartments(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/subDepartments`, this.httpOptions);
  }
  getDepartments(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/departments-by-company`, this.httpOptions);
  }
    getDesignations(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/designations-by-company`, this.httpOptions);
  }
  getLocations(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/company/locations-by-company`, this.httpOptions);
  }
}
