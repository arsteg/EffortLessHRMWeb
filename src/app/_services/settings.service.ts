import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { userRole } from '../models/role.model';
import { baseService } from './base';
import { Preference, preferenceCategory, userPreference } from '../models/settings/userPreferences/userPreferences';

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends baseService {

  constructor(private http:HttpClient) {
    super();
  }

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Authorization': `Bearer ${this.getToken()}` }),
    withCredentials: true
  };

  getPreferenCategories(): Observable<preferenceCategory[]> {
    return this.http.get<preferenceCategory[]>(environment.apiUrlDotNet+'/userPreferences/preference-categories');
  }
  getUserPreference(categoryId:string): Observable<userPreference[]> {
    return this.http.get<userPreference[]>(environment.apiUrlDotNet+`/userPreferences/preferences/${categoryId}`);
  }

  updateUserPreference(id:string, preference:Preference): Observable<userPreference> {
    return this.http.post<userPreference>(environment.apiUrlDotNet+`/userPreferences/preferences/${id}`,preference,this.httpOptions);
  }














  getAllRole(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/auth/roles`, this.httpOptions);
  }

  addRole(role): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/auth/role`, role, this.httpOptions);
  }

  updateRole(id: string , Name: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/auth/role/update/${id}`, { Name }, this.httpOptions);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/auth/role/${id}`, this.httpOptions);
  }

}
