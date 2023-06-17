
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Email } from '../models/Email';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailtemplateService {
  private readonly token = this.getToken();
  private readonly apiUrl = environment.apiUrlDotNet;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Method': 'GET',
      'Authorization': `Bearer ${this.token}`,
      'SameSite': 'None'
    }),
    withCredentials: true
  };
  constructor(private http: HttpClient) { }

  public getToken() {
    return localStorage.getItem('jwtToken');
  }
  getAllEmails(): Observable<Email[]> {
    return this.http.get<Email[]>(`${this.apiUrl}/common/emailTemplates`, this.httpOptions);
  }
  addEmail(email: Email): Observable<Email> {
    return this.http.post<Email>(`${this.apiUrl}/common/emailTemplate`, email, this.httpOptions);
  }

  updateEmail(id, Email: Email): Observable<Email>{
    return this.http.put<Email>(`${this.apiUrl}/common/emailTemplates/${id}`,Email, this.httpOptions);
  }
  deleteEmail(id:string): Observable<Email> {
    return this.http.delete<Email>(`${environment.apiUrlDotNet}/common/emailTemplates/${id}`, this.httpOptions);
  }
}
