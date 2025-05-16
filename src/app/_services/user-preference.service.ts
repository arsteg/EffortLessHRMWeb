import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
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

export interface UserPreferenceStructure {
    key: string;
    metadata?: {
        inputType: string;
        id: string;
        name: string;
        label?: string;
        placeholder?: string;
        options?: string[];
        setbyadmin?: boolean;
    };
}

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
  private preferencesSubject = new BehaviorSubject<UserPreferenceStructure[]>([]);
  preferences = this.preferencesSubject.asObservable();
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading = this.isLoadingSubject.asObservable();
    
  constructor(private http: HttpClient) {
    this.loadPreferencesStructure();
  }

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

  private loadPreferencesStructure(): void {
    this.isLoadingSubject.next(true);
    this.getPreferenceStructure().subscribe({
      next: (preferences) => {
        this.preferencesSubject.next(preferences);
        this.isLoadingSubject.next(false);
      },
      error: (error) => {
        console.error('Failed to load preferences:', error);
        this.preferencesSubject.next([]); // Fallback to empty array
        this.isLoadingSubject.next(false);
      }
    });
  }

  getPreferencesStructure(): Observable<UserPreferenceStructure[]> {
    return this.preferences;
  }
  
  getPreferenceStructureByKey(key: string): Observable<UserPreferenceStructure | undefined> {
    return this.preferences.pipe(
      map(preferences => preferences.find(pref => pref.key === key))
    );
  }

  getExplicitPreferenceStructure(): Observable<UserPreferenceStructure[]> {
    return this.preferences.pipe(
      map(preferences => preferences.filter(pref => pref.key.endsWith('_explicit') && pref.metadata))
    );
  }

  // Refresh preferences (e.g., after locale change)
  refreshPreferences(): void {
        this.loadPreferencesStructure();
  }

  getPreferenceStructure(): Observable<any> {
    const httpOptions = {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }),
        withCredentials: true
    };

    return this.http.get<{ status: string; message: string; data: UserPreferenceStructure[] }>(
            `${environment.apiUrlDotNet}/userpreferences/structure`,
            httpOptions
        ).pipe(
            tap(response => {
                if (response.status !== 'success') {
                    throw new Error(response.message || 'Failed to fetch preferences structure.');
                }
            }),
            map(response => response.data),
            catchError(error => {
                console.error('Error fetching preference structure:', error);
                return throwError(() => new Error(`Failed to fetch preference structure: ${error.message || error.statusText}`));
            })
        );
    //return this.http.get<any>(`${environment.apiUrlDotNet}/userpreferences/structure`, httpOptions);
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
}