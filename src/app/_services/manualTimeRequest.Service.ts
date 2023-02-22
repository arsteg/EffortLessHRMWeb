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
  public getManualTimeRequestsByUser(userId:string): any {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.get<any>(`${environment.apiUrlDotNet}/manualTime/getManualTimeRequests/${userId}`,httpOptions);
    return response;
  }
  public DeleteManualTimeRequest(Id:string): any {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.delete<any>(`${environment.apiUrlDotNet}/manualTime/manualTimeRequest/${Id}`,httpOptions);
    return response;
  }
  addManualTimeRequest(request:manualTimeRequest):Observable<any>{
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    }
    return this.http.post(`${environment.apiUrlDotNet}/manualTime/addManualTimeRequest`, request,httpOptions);
  }
  updateManualTimeRequest(request:manualTimeRequest):Observable<any>{
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      })
    }
    return this.http.post(`${environment.apiUrlDotNet}/manualTime/updateManualTimeRequest`, request,httpOptions);
  }
getManualTimeRequestsForApprovalByUser(userId:string): any {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.get<any>(`${environment.apiUrlDotNet}/manualTime/getManualTimeRequestsForApproval/${userId}`,httpOptions);
    return response;
  }

  getManualTimeApprovedRequests(userId:string,projectId:string,managerId:string): any {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.get<manualTimeRequest>(`${environment.apiUrlDotNet}/manualTime/getManualTimeApprovedRequests/${userId}/${projectId}/${managerId}`,httpOptions);
    return response;
  }

}
