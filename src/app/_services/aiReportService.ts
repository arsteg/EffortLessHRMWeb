import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AIReportService {

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

   generateQueryFromText(query: any): Observable<any> {
      const httpOptions = this.getHttpOptions();
      return this.http.post<any>(`${environment.apiUrlDotNet}/openai/generateQueryFromText`, query, httpOptions);
    }

    chatBot(userMessage: string): Observable<any> {    
      const httpOptions = this.getHttpOptions();
      return this.http.post<any>(`${environment.apiUrlDotNet}/openai/chatBot`, {userMessage}, httpOptions);
    }
}
