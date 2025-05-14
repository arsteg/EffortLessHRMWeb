import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserPreference {
    _id: string;
    userId: string;
    preferenceOptionId: string;
    createdAt: Date;
    updatedAt: Date;
  }

export interface PreferenceOption {
    _id: string;
    preferenceKey: string;
    preferenceValue: string;
    createdAt: Date;
    updatedAt: Date;
  }

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
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

  createOrUpdatePreference(
    userId: string,
    preferenceKey: string,
    preferenceValue: string
  ): Observable<{ status: string; message: string; data: { userPreference: UserPreference } }> {
    const httpOptions = {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }),
        withCredentials: true
    };

    const body = {
      userId,
      preferenceKey,
      preferenceValue: preferenceValue
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/userPreferences/create`, body, httpOptions).pipe(
        catchError(error => {
          console.error('Error in createOrUpdatePreference:', error);
          return throwError(() => new Error(`Failed to create or update preference: ${error.message || error.statusText}`));
        })
      );
  }

  getPreferenceByKey(preferenceKey: string): Observable<PreferenceOption[]> {
    const httpOptions = {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }),
        withCredentials: true
    };
    return this.http.get<PreferenceOption[]>(`${environment.apiUrlDotNet}/userPreferences/preference-key/${preferenceKey}`, httpOptions);
  }

  getPreferencesByUserId(userId: string): Observable<any> {
    const httpOptions = {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }),
        withCredentials: true
    };
    return this.http.get<any>(`${environment.apiUrlDotNet}/userPreferences/user/${userId}`, httpOptions);
  }
}