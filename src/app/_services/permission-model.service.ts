import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { constant } from '../constants/constant';
import { baseService } from './base';
import { rolePermission, createRolePermissions } from '../models/permissionModel';

@Injectable({
  providedIn: 'root'
})
export class PermissionModelService extends baseService {

  constructor(private http: HttpClient) {
    super();
  }

  private getHttpOptions(): { headers: HttpHeaders, withCredentials: boolean } {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    });
    const withCredentials = true;
    return { headers, withCredentials };
  }

  private getEndpointUrl(endpoint: string): string {
    return `${environment.apiUrlDotNet}${endpoint}`;
  }

  getRolePermissionId(): Observable<rolePermission[]> {
    const url = this.getEndpointUrl(constant.apiEndPoint.rolePermissionId);
    return this.http.get<rolePermission[]>(url);
  }

  getRolePermissions(): Observable<any> {
    const httpOptions = this.getHttpOptions();
    const url = this.getEndpointUrl('/auth/rolePermissions');
    return this.http.get<any>(url, httpOptions);
  }

  createRolePermission(createRolePermissions: createRolePermissions): Observable<any> {
    const httpOptions = this.getHttpOptions();
    const url = this.getEndpointUrl('/auth/rolePermission/create');
    return this.http.post<any>(url, createRolePermissions, httpOptions);
  }

  updateRolePermission(id: string, createRolePermissions: createRolePermissions): Observable<any> {
    const httpOptions = this.getHttpOptions();
    const url = this.getEndpointUrl(`/auth/rolePermission/update/${id}`);
    return this.http.post<any>(url, createRolePermissions, httpOptions);
  }

  deleteRolePermission(id: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    const url = this.getEndpointUrl(`/auth/rolePermission/delete/${id}`);
    return this.http.delete<any>(url, httpOptions);
  }
}
