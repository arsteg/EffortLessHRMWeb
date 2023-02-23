import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { baseService } from '../_services/base';
import { BehaviorSubject, Observable } from 'rxjs';
import { permissions } from './permission';
import { Permission } from '../models/permissionModel';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService extends baseService {

  constructor(private http: HttpClient) {
    super();
  }
  getPermissions(): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true

    };
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/auth/permissions`, httpOptions);
    return response;
  }

  addPermission(permissions: permissions): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/auth/permission/create`, permissions , httpOptions);
    return response;
  }

  updatePermission(id, permission: Permission): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/auth/permission/update/${id}`, permission , httpOptions);
    return response;
  }

  deletePermission(id: string): Observable<any>{
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`}),
      withCredentials: true
    };
    return this.http.delete<any>(`${environment.apiUrlDotNet}/auth/permission/delete/${id}`,httpOptions);
  }
}
