import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { Subordinate,  } from '../models/subordinate.Model';


@Injectable({
  providedIn: 'root'
})
export class ManageTeamService extends baseService {

  constructor(private http: HttpClient) {
    super();
  }

  public getAllUsers(): any {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.get<any>(`${environment.apiUrlDotNet}/users`,httpOptions);
   return response;
  }

  public addSubordinate(subordinates:Subordinate): any {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/auth/roles/addSubordinate`,subordinates,httpOptions);
    return response;
  }

  public deleteSubordinate(userId,subordinateUserId:string ): any {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.delete<any>(`${environment.apiUrlDotNet}/auth/roles/deleteSubordinate/${userId.id}/${subordinateUserId}`,httpOptions);
    return response;
  }

 
}
