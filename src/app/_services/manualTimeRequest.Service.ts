import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { manualTimeRequest } from '../models/manualTime/manualTimeRequest';
import { Observable } from 'rxjs/internal/Observable';


@Injectable({
  providedIn: 'root'
})
export class ManualTimeRequestService extends baseService{
  constructor(private http: HttpClient) {
    super();
  }
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${this.getToken()}`
    }),
    withCredentials: true
  };
  
  public getManualTimeRequestsByUser(userId:string, payload: any): any {
    return this.http.post<any>(`${environment.apiUrlDotNet}/manualTime/getManualTimeRequests/${userId}`, payload, this.httpOptions);
  }
  
  public DeleteManualTimeRequest(Id:string): any {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/manualTime/manualTimeRequest/${Id}`, this.httpOptions);
  }
  
  addManualTimeRequest(request:any):Observable<any>{
    return this.http.post(`${environment.apiUrlDotNet}/manualTime/addManualTimeRequest`, request, this.httpOptions);
  }
  
  updateManualTimeRequest(request:any):Observable<any>{
    return this.http.post(`${environment.apiUrlDotNet}/manualTime/updateManualTimeRequest`, request, this.httpOptions);
  }
  
  getManualTimeRequestsForApprovalByUser(userId:string): any {
    return this.http.get<any>(`${environment.apiUrlDotNet}/manualTime/getManualTimeRequestsForApproval/${userId}`, this.httpOptions);
  }

  getManualTimeApprovedRequests(userId:string,projectId:string,managerId:string): any {
    return this.http.get<manualTimeRequest>(`${environment.apiUrlDotNet}/manualTime/getManualTimeApprovedRequests/${userId}/${projectId}/${managerId}`, this.httpOptions);
  }

  addManualTime(user:string,task:string,projectId:string, startTime:string, endTime:string,date:string): any {
    return this.http.post<any>(`${environment.apiUrlDotNet}/manualTime/addManualTime`,{user,task,projectId, startTime, endTime,date}, this.httpOptions);
  }
}
