import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { applicationStatus } from '../models/interviewProcess/applicationStatus';
import { candidateDataField } from '../models/interviewProcess/candidateDataField';
import { candidate } from '../models/interviewProcess/candidate';
import { candidateDataFieldValue } from '../models/interviewProcess/candidateDataFieldValue';
import { feedbackField } from '../models/interviewProcess/feedbackField';
import { InterviewDetail } from '../models/interviewProcess/candidateInterviewDetail';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService extends baseService {
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

  //zoom meeting api's
  createMeeting(meetingData: any): Observable<any> {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/zoom/createmeeting`, meetingData, this.httpOptions);
  }
  createMeetingSignature(signatureData: any): Observable<any> {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/zoom/createmeetingsingture`, signatureData, this.httpOptions);
  }
  //zoom meeting api's
}
