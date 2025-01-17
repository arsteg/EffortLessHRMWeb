import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeparationService {
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

  // Resignation API Methods
  addResignation(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/separation/resignations`, payload, this.httpOptions);
  }

  getResignationsByUserId(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/separation/resignations-by-user/${userId}`, this.httpOptions);
  }

  getResignationsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/separation/resignations-by-status/${status}`, this.httpOptions);
  }

  getResignationsByCompany(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/separation/resignations-by-company`, this.httpOptions);
  }

  updateResignationById(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/separation/resignations/${id}`, payload, this.httpOptions);
  }

  deleteResignationById(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/separation/resignations/${id}`, this.httpOptions);
  }

  updateResignationStatus(id: string, status: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/separation/resignations-by-status/${id}`,  status, this.httpOptions);
  }
  

  // Termination API methods
  addTermination(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/separation/termination`, payload, this.httpOptions);
  }

  getTerminationByUserId(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/separation/termination-by-user/${userId}`, this.httpOptions);
  }

  getTerminationByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/separation/termination-by-status/${status}`, this.httpOptions);
  }

  getTerminationByCompany(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/separation/termination-by-company`, this.httpOptions);
  }

  updateTerminationById(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/separation/resignations/${id}`, payload, this.httpOptions);
  }

  deleteTerminationById(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/separation/termination/${id}`, this.httpOptions);
  }

  updateTerminationStatus(id: string, status: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/separation/termination-by-status/${id}`,  status, this.httpOptions);
  }

}