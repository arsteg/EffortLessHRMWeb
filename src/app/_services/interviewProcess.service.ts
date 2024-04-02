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

  public getAllCandidates(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/interviews/candidatesWithData`, this.httpOptions);
  }
  public addCandidate(candidate: candidate): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/interviews/candidates`, candidate, this.httpOptions);
  }

  public updateCandidate(candidate: candidate): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/interviews/candidates/${candidate._id}`, candidate, this.httpOptions);
  }

  public deleteCandidate(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/interviews/candidates/${id}`, this.httpOptions);
  }

  public addDataFieldValue(dataFieldValue: candidateDataFieldValue): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/interviews/candidate-data-field-values`, dataFieldValue, this.httpOptions);
  }

  public deleteDataFieldValue(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/interviews/candidate-data-field-values/${id}`, this.httpOptions);
  }
  public addFeedbackField(feedbackField: feedbackField): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/interviews/feedback-fields`, feedbackField, this.httpOptions);
  }
  public getAllFeedbackFields(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/interviews/feedback-fields`, this.httpOptions);
  }
  public getFeedbackField(id:string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/interviews/feedback-fields/${id}`, this.httpOptions);
  }

  public updateFeedbackField(feedbackField: feedbackField): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/interviews/feedback-fields/${feedbackField._id}`, feedbackField, this.httpOptions);
  }
  public deleteFeedbackField(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/interviews/feedback-fields/${id}`, this.httpOptions);
  }
  public feedbackFieldsWithData(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/interviews/feedback-fields-with-data`, this.httpOptions);
  }

  public deleteFeedbackFieldValue(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/interviews/feedback-field-values/${id}`, this.httpOptions);
  }
  public updateFeedbackFieldValue(feedbackField: any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/interviews/feedback-field-values`, feedbackField, this.httpOptions);
  }

  // Interview Details API's

  public addInterviewDetails(interviewDetails: InterviewDetail): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/interviews/candidate-interview-details`, interviewDetails, this.httpOptions);
  }
  public getAllInterviewDetails(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/interviews/candidate-interview-details`, this.httpOptions);
  }
  public getInterviewDetailsById(id:string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/interviews/candidate-interview-details/${id}`, this.httpOptions);
  }
  public updateInterviewDetail(interviewDetails:any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/interviews/candidate-interview-details`, interviewDetails, this.httpOptions);
  }
  public deleteInterviewDetail(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/interviews/candidate-interview-details/${id}`, this.httpOptions);
  }
  //End of Interview Details API's

  // Interviewer API's

  public addInterviewer(interviewer: string ): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/interviews/Interviewer`, {
      "interviewer": interviewer
    }, this.httpOptions);
  }
  public getAllInterviewers(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/interviews/Interviewer`, this.httpOptions);
  }
  public updateInterviewer(interviewDetails:any): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${environment.apiUrlDotNet}/interviews/Interviewer`, interviewDetails, this.httpOptions);
  }
  public deleteInterviewer(id: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/interviews/Interviewer/${id}`, this.httpOptions);
  }
  //End of Interviewer API's

}
