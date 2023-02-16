import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';


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
}
