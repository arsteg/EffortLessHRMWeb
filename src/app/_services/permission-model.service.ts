import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { constant } from '../constants/constant';
import { Observable } from 'rxjs';
import { rolePermission, createRolePermissions } from '../models/permissionModel';
import { baseService } from './base';

@Injectable({
  providedIn: 'root'
})
export class PermissionModelService extends baseService{

  constructor(private http:HttpClient) {
    super();
   }

  getRolePermissionId():Observable<rolePermission[]>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionId);
    return this.http.get<rolePermission[]>(environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionId);
  }
  getRolePermissions(): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`}),
      withCredentials: true
    };
    var response  = this.http.get<any>(`${environment.apiUrlDotNet}/auth/rolePermissions`, httpOptions);
   return response;
  }

  createRolePermission(createRolePermissions : createRolePermissions):Observable<any>{
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`}),
      withCredentials: true
    };
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/auth/rolePermission/create`, createRolePermissions ,httpOptions);
   return response;
  }
  updateRolePermission(id: string, createRolePermissions):Observable<any>{
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`}),
      withCredentials: true
    };
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/auth/rolePermission/update/${id}`, createRolePermissions ,httpOptions);
   return response;
   }
   
   deleteRolePermission(id: string):Observable<any>{
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`}),
      withCredentials: true
    };
    var response  = this.http.delete<any>(`${environment.apiUrlDotNet}/auth/rolePermission/delete/${id}`, httpOptions);
   return response;
  }
}


