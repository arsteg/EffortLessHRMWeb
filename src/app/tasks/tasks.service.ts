import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { baseService } from '../_services/base';
import { Task } from './task';
import { project } from '../Project/model/project';
import { tag } from '../models/tag';

@Injectable({
  providedIn: 'root'
})
export class TasksService extends baseService {

  constructor(private http: HttpClient) {
    super();
  }

  getAllTasks(): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/task/tasklist`, httpOptions);
    return response;
  }

  addtask(Task): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/task/newtask`, Task, httpOptions);
  }

  deletetask(id) {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.delete<Task>(`${environment.apiUrlDotNet}/task/${id}`, httpOptions);
  }

  updatetask(id, Task): Observable<Task> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.patch<Task>(`${environment.apiUrlDotNet}/task/update/${id}`, Task, httpOptions);
  }

  addUserToTask(taskId, taskUsers): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/task/newtaskuser`, { taskId, taskUsers }, httpOptions);
  }

  getTaskByProjectId(projectId: string): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.get<project>(`${environment.apiUrlDotNet}/task/tasklistbyproject/${projectId}`, httpOptions);
  }
  deleteTaskUser(id: string): Observable<any>{
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.delete<any>(`${environment.apiUrlDotNet}/task/taskuser/${id}`,httpOptions);
  }
  gettaskUser(id: string) : Observable<any>{
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/task/gettaskuserslist/${id}`,httpOptions);
    return response;
  }
  getTaskByUser(userId): Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/task/tasklistbyuser`, {userId }, httpOptions);
  }

  getAllTags(): Observable<tag[]> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    var response = this.http.get<tag[]>(`${environment.apiUrlDotNet}/task/tags/0`, httpOptions);
    return response;
  }

  AddTag(tag:tag): Observable<tag> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    var response = this.http.post<tag>(`${environment.apiUrlDotNet}/task/tag/add`, tag,httpOptions);
    return response;
  }
  UpdateTag(tag:tag): Observable<tag> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    var response = this.http.post<tag>(`${environment.apiUrlDotNet}/task/tag/update`, tag,httpOptions);
    return response;
  }

  DeleteTag(tagId:string): Observable<tag> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      withCredentials: true
    };
    var response = this.http.delete<tag>(`${environment.apiUrlDotNet}/task/tag/${tagId}`, httpOptions);
    return response;
  }


}
