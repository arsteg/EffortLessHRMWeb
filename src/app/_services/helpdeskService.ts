import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HelpdeskService {

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    });
    const httpOptions = { headers, withCredentials: true };
    return httpOptions;
  }

  createHelpdeskTicket(formData: FormData): Observable<any> {
    const httpOptions = {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }),
        withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/helpdesk/create`, formData, httpOptions);
  }

  getAllHelpdeskByUser(payload: any): Observable<any> {
    const httpOptions = {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }),
        withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/helpdesk/user`, payload, httpOptions);
  }

  deleteHelpdeskById(id: string): Observable<any> {
    const httpOptions = {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }),
        withCredentials: true
    };
    return this.http.delete<any>(`${environment.apiUrlDotNet}/helpdesk/${id}`, httpOptions);
  }

  updateHelpdeskTicket(id: string, body: { status: string; remark: string }): Observable<any> {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    }),
    withCredentials: true
  };
  return this.http.patch<any>(`${environment.apiUrlDotNet}/helpdesk/${id}`, body, httpOptions);
}
    
}
