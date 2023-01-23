import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { project } from './model/project';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })

export class ProjectService {
    constructor(private http: HttpClient) {
    }

  getprojectlist() {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.get<project[]>(`${environment.apiUrlDotNet}/project/projectlist`, httpOptions)
  }

  addproject(project: project): Observable<project> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.post<project>(`${environment.apiUrlDotNet}/project/newproject`, project, httpOptions);
  }

  deleteproject(id){
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.delete<project>(`${environment.apiUrlDotNet}/project/${id}`,httpOptions);
  }
  
  updateproject(id, project):Observable<project>{
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.patch<project>(`${environment.apiUrlDotNet}/project/${id}`, project , httpOptions);
  }

 getProjectByUserId(userId: string): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.post<project>(`${environment.apiUrlDotNet}/project/projectlistbyuser`, {userId}, httpOptions);
  }
}