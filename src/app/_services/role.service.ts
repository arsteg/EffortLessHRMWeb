import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { userRole } from '../models/role.model';
import { baseService } from './base';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends baseService {

  constructor(private http:HttpClient) { 
    super();
  }
  
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Authorization': `Bearer ${this.getToken()}` }),
    withCredentials: true
  };

  getUserRoleId(): Observable<userRole[]> {
    console.log('url ' + environment.apiUrlDotNet+'/userRoleId');
    return this.http.get<userRole[]>(environment.apiUrlDotNet+'/userRoleId');
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
