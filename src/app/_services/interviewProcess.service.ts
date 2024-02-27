import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { applicationStatus } from '../models/interviewProcess/applicationStatus';
import { candidateDataField } from '../models/interviewProcess/candidateDataField';

@Injectable({
  providedIn: 'root'
})
export class InterviewProcessService extends baseService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {
    super();
  }

  public getAllApplicationStatus(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/interviews/application-status`, this.httpOptions);
  }

  public addApplicationStatus(name: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/interviews/application-status`, name, this.httpOptions);
  }

  public updateApplicationStatus(status: applicationStatus): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/interviews/application-status/${status._id}`, status, this.httpOptions);
  }

  public deleteApplicationStatus(applicationStatusId:string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/interviews/application-status/${applicationStatusId}`, this.httpOptions);
  }

  public getAllCandidateDataFields(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/interviews/candidate-data-fields`, this.httpOptions);
  }
  public addCandidateDataField(dataField: candidateDataField): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/interviews/candidate-data-fields`, dataField, this.httpOptions);
  }

  public updateCandidateDataField(dataField: candidateDataField): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/interviews/candidate-data-fields/${dataField._id}`, dataField, this.httpOptions);
  }
  public deleteDataField(deleteDataField:string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/interviews/candidate-data-fields/${deleteDataField}`, this.httpOptions);
  }
}
