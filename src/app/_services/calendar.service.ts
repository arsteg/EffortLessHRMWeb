import { Injectable } from '@angular/core';
import { CalendarEvent } from '../models/Calendar/CalendarEvent';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { response } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
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

  getAllCalendarEvents(): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/documents/template`, this.httpOptions);
   return response;
  }

  addEvent(calendarEvent: CalendarEvent): Observable<response<any>> {
    var response  = this.http.post<response<any>>(`${environment.apiUrlDotNet}/documents/template`, calendarEvent ,this.httpOptions);
   return response;
  }
 
  updateEvent(id:string, calendarEvent: CalendarEvent): Observable<response<any>> {
    var response  = this.http.put<response<any>>(`${environment.apiUrlDotNet}/documents/template/${id}`, calendarEvent ,this.httpOptions);
   return response;
  }

  deleteEvent(id:string): Observable<response<any>> {
    var response  = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/documents/template/${id}`, this.httpOptions);
   return response;
  }

}
