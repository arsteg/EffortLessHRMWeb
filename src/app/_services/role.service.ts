import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { constant } from '../constants/constant';
import { userRole } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private http:HttpClient) { }
  
  getUserRoleId():Observable<userRole[]>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.userRoleId);
    return this.http.get<userRole[]>(environment.apiUrlDotNet+constant.apiEndPoint.userRoleId);
  }
  getUserRoleAll():Observable<userRole[]>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.userRoleAll);
    return this.http.get<userRole[]>(environment.apiUrlDotNet+constant.apiEndPoint.userRoleAll);
  }
  createUserRole(obj:any):Observable<any>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.userRoleCreate);
    return this.http.post<any>(environment.apiUrlDotNet+constant.apiEndPoint.userRoleCreate, obj);
  }
  updateUserRole(obj:any):Observable<userRole>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.userRoleUpdate);
    return this.http.post<any>(environment.apiUrlDotNet+constant.apiEndPoint.userRoleUpdate, obj);
  }
  deleteUserRole(obj:any):Observable<any>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.userRoleDelete);
    return this.http.post<userRole>(environment.apiUrlDotNet+constant.apiEndPoint.userRoleDelete, obj);
  }
}

