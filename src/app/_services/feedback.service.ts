import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FeedbackField } from '../models/feedback/feedback-field.model';
import { Feedback} from '../models/feedback/feedback.model';
import { response } from '../models/response'; // Assuming this is your response model
import { environment } from 'src/environments/environment';
import { Barcode } from '../models/feedback/barcode';
import { APIResponse } from './base';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly apiUrl = environment.apiUrlDotNet; // Use .NET API URL from environment
  private readonly httpOptions = {
    headers: this.getAuthorizationHeader(),
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  // Get JWT token from localStorage
  private getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // Generate authorization headers
  private getAuthorizationHeader(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    });
  }

  // Handle HTTP errors
  private handleHttpError(error: any): Observable<never> {
    const errorMessage = error.error?.message || error.statusText || 'An error occurred';
    return throwError(() => new Error(errorMessage));
  }

  // Feedback Field APIs
  createFeedbackField(field: FeedbackField): Observable<response<FeedbackField>> {
    return this.http.post<response<FeedbackField>>(
      `${environment.apiUrlDotNet}/feedback/fields/create`,
      field,
      this.httpOptions
    ).pipe(
      catchError(this.handleHttpError)
    );
  }

  getFeedbackFieldsByCompany(companyId:string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrlDotNet}/feedback/Allfields/${companyId}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleHttpError)
    );
  }

  updateFeedbackField(id: string, field: Partial<FeedbackField>): Observable<response<FeedbackField>> {
    return this.http.patch<response<FeedbackField>>(
      `${environment.apiUrlDotNet}/feedback/fields/update/${id}`,
      field,
      this.httpOptions
    ).pipe(
      catchError(this.handleHttpError)
    );
  }

  deleteFeedbackField(id: string): Observable<response<any>> {
    return this.http.delete<response<any>>(
      `${environment.apiUrlDotNet}/feedback/fields/delete/${id}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleHttpError)
    );
  }

  // Feedback Submission APIs
  submitFeedback(feedback: Feedback): Observable<response<any>> {
    return this.http.post<response<Feedback>>(
      `${environment.apiUrlDotNet}/feedback/submit`,
      feedback,
      this.httpOptions
    ).pipe(
      catchError(this.handleHttpError)
    );
  }

  saveBarcode(storeId:string, tableId:string, url:string): Observable<any> {
    return this.http.post<response<Feedback>>(
      `${environment.apiUrlDotNet}/feedback/barcode`,
      {storeId, tableId, url},
      this.httpOptions
    ).pipe(
      catchError(this.handleHttpError)
    );
  }

  getFeedbackByCompany(startDate?: string, endDate?: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrlDotNet}/feedback?startDate=${startDate}&endDate=${endDate}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleHttpError)
    );
  } 
  
 // Barcode APIs
 createBarcode(barcode: { storeId: string; tableId: string; url: string }): Observable<APIResponse<Barcode>> {
  return this.http.post<APIResponse<Barcode>>(
    `${environment.apiUrlDotNet}/feedback/qrcodes`,
    barcode,
    this.httpOptions
  ).pipe(
    catchError(this.handleHttpError)
  );
}

getBarcodesByCompany(): Observable<APIResponse<Barcode[]>> {
  return this.http.get<APIResponse<Barcode[]>>(
    `${environment.apiUrlDotNet}/feedback/qrcodes`,
    this.httpOptions
  ).pipe(
    catchError(this.handleHttpError)
  );
}

getBarcodeById(id: string): Observable<APIResponse<Barcode>> {
  return this.http.get<APIResponse<Barcode>>(
    `${environment.apiUrlDotNet}/feedback/qrcodes/${id}`,
    this.httpOptions
  ).pipe(
    catchError(this.handleHttpError)
  );
}

updateBarcode(id: string, barcode: Partial<{ storeId: string; tableId: string; url: string }>): Observable<APIResponse<Barcode>> {
  return this.http.patch<APIResponse<Barcode>>(
    `${environment.apiUrlDotNet}/feedback/qrcodes/${id}`,
    barcode,
    this.httpOptions
  ).pipe(
    catchError(this.handleHttpError)
  );
}

deleteBarcode(id: string): Observable<APIResponse<any>> {
  return this.http.delete<APIResponse<any>>(
    `${environment.apiUrlDotNet}/feedback/qrcodes/${id}`,
    this.httpOptions
  ).pipe(
    catchError(this.handleHttpError)
  );
}
  

  


}