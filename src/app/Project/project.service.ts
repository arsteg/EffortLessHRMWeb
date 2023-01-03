import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { project } from './model/project';

@Injectable({ providedIn: 'root' })

export class ProjectService {
    constructor(private http: HttpClient) {
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
    return this.http.post<project>(`${environment.apiUrlDotNet}/project/newproject`, { project }, httpOptions);
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
}