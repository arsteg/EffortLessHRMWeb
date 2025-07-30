import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { Subordinate } from '../models/subordinate.Model';

@Injectable({
  providedIn: 'root'
})
export class ManageTeamService extends baseService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {
    super();
  }

  public getAllUsers(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/users`, this.httpOptions);
  }

  public addSubordinate(subordinates: Subordinate): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrlDotNet}/auth/roles/addSubordinate`, subordinates, this.httpOptions);
  }

  public deleteSubordinate(userId, subordinateUserId: string): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${environment.apiUrlDotNet}/auth/roles/deleteSubordinate/${userId.id}/${subordinateUserId}`, this.httpOptions);
  }

  public getManagers(): any {
    const token = this.getToken();
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrlDotNet}/auth/roles/getManagers`, this.httpOptions);
  }

}
