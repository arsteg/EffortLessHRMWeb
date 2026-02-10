import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailTemplateType } from '../models/EmailTemplateType';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateTypeService {
  private readonly token = this.getToken();
  private readonly apiUrl = environment.apiUrlDotNet;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Method': 'GET',
      'Authorization': `Bearer ${this.token}`
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) { }

  public getToken() {
    return localStorage.getItem('jwtToken');
  }

  getAllEmailTemplateTypes(): Observable<EmailTemplateType[]> {
    return this.http.get<EmailTemplateType[]>(`${this.apiUrl}/common/emailTemplateTypes`, this.httpOptions);
  }

  getEmailTemplateTypeById(id: string): Observable<EmailTemplateType> {
    return this.http.get<EmailTemplateType>(`${this.apiUrl}/common/emailTemplateType/${id}`, this.httpOptions);
  }

  addEmailTemplateType(emailTemplateType: EmailTemplateType): Observable<EmailTemplateType> {
    return this.http.post<EmailTemplateType>(`${this.apiUrl}/common/emailTemplateType`, emailTemplateType, this.httpOptions);
  }

  updateEmailTemplateType(id: string, emailTemplateType: EmailTemplateType): Observable<EmailTemplateType> {
    return this.http.put<EmailTemplateType>(`${this.apiUrl}/common/emailTemplateTypes/${id}`, emailTemplateType, this.httpOptions);
  }

  deleteEmailTemplateType(id: string): Observable<EmailTemplateType> {
    return this.http.delete<EmailTemplateType>(`${this.apiUrl}/common/emailTemplateTypes/${id}`, this.httpOptions);
  }

  changeEmailTemplateTypeStatus(id: string, emailTemplateType: EmailTemplateType): Observable<EmailTemplateType> {
    return this.http.put<EmailTemplateType>(`${this.apiUrl}/common/emailTemplateTypes/changestatus/${id}`, emailTemplateType, this.httpOptions);
  }
}
