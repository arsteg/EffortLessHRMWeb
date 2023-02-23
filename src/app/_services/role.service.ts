import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { constant } from '../constants/constant';
import { userRole } from '../models/role.model';
import { baseService } from './base';
@Injectable({
  providedIn: 'root'
})
export class RoleService extends baseService {

  constructor(private http:HttpClient) { 
    super();
  }
  
  getUserRoleId():Observable<userRole[]>{
    // debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.userRoleId);
    return this.http.get<userRole[]>(environment.apiUrlDotNet+constant.apiEndPoint.userRoleId);
  }

  getAllRole(): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`}),
      withCredentials: true
    };
    var response  = this.http.get<any>(`${environment.apiUrlDotNet}/auth/roles`, httpOptions);
   return response;
  }

  addRole(role): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`}),
      withCredentials: true
    };
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/auth/role`, role ,httpOptions);
   return response;
  }
  updateRole(id: string , Name: string): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`}),
      withCredentials: true
    };
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/auth/role/update/${id}`, { Name } ,httpOptions);
   return response;
  }
  deleteRole(id: string): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`}),
      withCredentials: true
    };
    var response  = this.http.delete<any>(`${environment.apiUrlDotNet}/auth/role/${id}` ,httpOptions);
   return response;
  }
  
}

