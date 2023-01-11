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
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.get<any>(`${environment.apiUrlDotNet}/auth/roles`, httpOptions);
   return response;
  }

  createUserRole(obj:any):Observable<any>{
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.userRoleCreate);
    return this.http.post<any>(environment.apiUrlDotNet+constant.apiEndPoint.userRoleCreate, obj);
  }
  updateUserRole(obj:any):Observable<userRole>{
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.userRoleUpdate);
    return this.http.post<any>(environment.apiUrlDotNet+constant.apiEndPoint.userRoleUpdate, obj);
  }
  deleteUserRole(obj:any):Observable<any>{
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.userRoleDelete, obj);
    return this.http.delete<any>(environment.apiUrlDotNet+constant.apiEndPoint.userRoleDelete, obj);
  }
}

