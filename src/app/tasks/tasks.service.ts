import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { baseService } from '../_services/base';
import { Task } from './task';

@Injectable({
  providedIn: 'root'
})
export class TasksService extends baseService{

  constructor(private http: HttpClient) { 
    super();
  }

  getAllTasks(): Observable<any> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.get<any>(`${environment.apiUrlDotNet}/task/tasklist`,httpOptions);
   return response;
  }

  addtask(task: Task):Observable<any> {
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.post<any>(`${environment.apiUrlDotNet}/task/newtask`, task, httpOptions);
  }

deletetask(id){
  let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    };
    return this.http.delete<Task>(`${environment.apiUrlDotNet}/task/${id}`,httpOptions);
}

updateproject(id, Task):Observable<Task>{
  let token = localStorage.getItem('jwtToken');
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    })
  };
  return this.http.patch<Task>(`${environment.apiUrlDotNet}/task/update/${id}`, Task , httpOptions);
}
}
