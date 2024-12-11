import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { baseService } from './base';
import { permissions } from '../feature_modules/permissions/permissions/permission';
import { Permission } from '../models/permissionModel';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService extends baseService {

  constructor(private http: HttpClient) {
    super();
  }

  private createHttpOptions(): { headers: HttpHeaders, withCredentials: boolean } {
    let token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    });
    return { headers, withCredentials: true };
  }

  getPermissions(): Observable<any> {
    const httpOptions = this.createHttpOptions();
    return this.http.get<any>(`${environment.apiUrlDotNet}/auth/permissions`, httpOptions);
  }

  addPermission(permissions: permissions): Observable<any> {
    const httpOptions = this.createHttpOptions();
    return this.http.post<any>(`${environment.apiUrlDotNet}/auth/permission/create`, permissions , httpOptions);
  }

  updatePermission(id, permission: Permission): Observable<any> {
    const httpOptions = this.createHttpOptions();
    return this.http.post<any>(`${environment.apiUrlDotNet}/auth/permission/update/${id}`, permission , httpOptions);
  }

  deletePermission(id: string): Observable<any>{
    const httpOptions = this.createHttpOptions();
    return this.http.delete<any>(`${environment.apiUrlDotNet}/auth/permission/delete/${id}`,httpOptions);
  }
}
