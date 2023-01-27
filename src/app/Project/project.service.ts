import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { addUser, project } from './model/project';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })

export class ProjectService {
    constructor(private http: HttpClient) {
    }

  getprojectlist() : Observable<any>{
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      
    };
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/project/projectlist`,httpOptions);
    return response;
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

  addUserToProject(projectId, projectUsers): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/project/newprojectuser`, {projectId, projectUsers}, httpOptions);
  }

  getprojectUser(id: string) : Observable<any>{
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      
    };
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/project/getprojectuserslist/${id}`,httpOptions);
    return response;
  }

  deleteprojectUser(id: string): Observable<any>{
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.delete<any>(`${environment.apiUrlDotNet}/project/projectuser/${id}`,httpOptions);
  }
}

