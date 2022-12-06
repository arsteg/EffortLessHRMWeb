import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AgPickerField } from 'ag-grid-community/dist/lib/widgets/agPickerField';
import { constant } from '../constants/constant';
import { Observable } from 'rxjs';
import { rolePermission } from '../models/permissionModel';


@Injectable({
  providedIn: 'root'
})
export class PermissionModelService {

  constructor(private http:HttpClient) { }

  getRolePermissionId():Observable<rolePermission[]>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionId);
    return this.http.get<rolePermission[]>(environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionId);
  }
  getRolePermissions():Observable<rolePermission[]>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.rolePermissions);
    return this.http.get<rolePermission[]>(environment.apiUrlDotNet+constant.apiEndPoint.rolePermissions);
  }
  createRolePermission(obj:any):Observable<any>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionCreate);
    return this.http.post<any>(environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionCreate, obj);
  }
  updateRolePermission(obj:any):Observable<rolePermission>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionUpdate);
    return this.http.post<any>(environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionUpdate, obj);
  }
  deleteRolePermission(obj:any):Observable<any>{
    debugger;
    console.log('url ' + environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionDelete);
    return this.http.post<rolePermission>(environment.apiUrlDotNet+constant.apiEndPoint.rolePermissionDelete, obj);
  }
}


