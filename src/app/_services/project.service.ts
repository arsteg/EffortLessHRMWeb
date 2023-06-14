import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { project } from '../Project/model/project';
import { baseService } from './base';

@Injectable({ providedIn: 'root' })

export class ProjectService  {
  private readonly token = this.getToken();
  private readonly apiUrl = environment.apiUrlDotNet;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${this.token}`
    }),
    withCredentials: true
  };
    constructor(private http: HttpClient) {

    }
    public getToken() {
      return localStorage.getItem('jwtToken');
    }

  getprojectlist() : Observable<any>{
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/project/projectlist`, this.httpOptions);
    return response;
  }
  getprojects(skip: string, next: string) : Observable<any>{
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/project/projectlist`, {skip, next},this.httpOptions);
    return response;
  }
  addproject(project: project): Observable<project> {
  var response =  this.http.post<project>(`${environment.apiUrlDotNet}/project/newproject`, project,  this.httpOptions);
    return response;
  }

  deleteproject(id){
    return this.http.delete<project>(`${environment.apiUrlDotNet}/project/${id}`, this.httpOptions);
  }

  updateproject(id, project):Observable<project>{
    return this.http.patch<project>(`${environment.apiUrlDotNet}/project/${id}`, project ,  this.httpOptions);
  }

 getProjectByUserId(userId: string): Observable<any> {
  return this.http.post<project>(`${environment.apiUrlDotNet}/project/projectlistbyuser`, {userId},  this.httpOptions);
  }

  addUserToProject(projectId, projectUsers): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/project/newprojectuser`, {projectId, projectUsers},  this.httpOptions);
  }

  getprojectUser(id: string) : Observable<any>{
   var response = this.http.get<any>(`${environment.apiUrlDotNet}/project/getprojectuserslist/${id}`, this.httpOptions);
    return response;
  }

  deleteprojectUser(id: string): Observable<any>{
   return this.http.delete<any>(`${environment.apiUrlDotNet}/project/projectuser/${id}`, this.httpOptions);
  }
}
