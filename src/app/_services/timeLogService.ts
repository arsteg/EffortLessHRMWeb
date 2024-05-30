import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { company } from '../models/company';
import { environment } from 'src/environments/environment';
import { RealTime, timeLog } from '../models/timeLog';
import {response} from '../models/response'
import { baseService } from './base';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class TimeLogService{
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

  
  private messageSource = new BehaviorSubject<any>(0);
  currentMessage = this.messageSource.asObservable();

  private getAuthorizationHeader() {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    });
  }
  constructor(private http: HttpClient) {

  }
  public getToken() {
    return localStorage.getItem('jwtToken');
  }
  getCompanyList(): Observable<company> {
    return this.http.get<company>(`/api/books`)
      .pipe(
        map(b => <company>{
        })
      )
  }

  getLogsWithImages(email, selectedDate): Observable<response<timeLog[]>> {
    var response  = this.http.post<response<timeLog[]>>(`${environment.apiUrlDotNet}/timeLogs/getLogsWithImages`,{
      "user":email,
      "date":selectedDate
   }, this.httpOptions);
   return response;
  }
  getCurrentWeekTotalTime(email, startDate, endDate): Observable<response<timeLog[]>> {
    var response  = this.http.post<response<timeLog[]>>(`${environment.apiUrlDotNet}/timeLogs/getCurrentWeekTotalTime`,{
      "user":email,
      "startDate":startDate,
      "endDate":endDate,
   }, this.httpOptions);
   return response;
  }


  getTeamMembers(userId): any {
    var response  = this.http.get<any>(`${environment.apiUrlDotNet}/auth/roles/getSubordinates/${userId}`, this.httpOptions);
   return response;

  }

  getusers(ids): any {
  var response  = this.http.post<any>(`${environment.apiUrlDotNet}/users/getUsers`,{"userId":ids}, this.httpOptions);
  return response;

  }

  deletetimelog(logs:any):Observable<timeLog>{
    return this.http.delete<timeLog>(`${environment.apiUrlDotNet}/timelogs/deleteTimeLog`, { headers: this.getAuthorizationHeader(), body: logs });
  }

  addManualTime(user:string,task:string,projectId:string, startTime:string, endTime:string,date:string): any {
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/timelogs/addTimeLog`,{user,task,projectId, startTime, endTime,date},this.httpOptions);
    return response;
  }

  realTime(realtime: RealTime): any {
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/timelogs/getLogInUsers`, realtime, this.httpOptions);
    return response;
  }

  getUserTimeSheet(userId:string,startDate:string,endDate:string ): any {
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/timelogs/timesheet`,{"userId":userId,"startDate":startDate,"endDate":endDate}, this.httpOptions);
    return response;
  }

  geAdminTimeSheet(userId:string,fromDate:string,toDate:string ): any {
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/timelogs/timesheets`, {"userIds" :userId, "startDate":fromDate, "endDate":toDate},this.httpOptions);
    return response;
  }

  createLiveScreenRecord(requestBody: any): any {
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/liveTracking/setLiveTrackingByUser`, requestBody, this.httpOptions);
    return response;
  }

  removeLiveScreenRecord(requestBody: any): any {
    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/liveTracking/removeUserFromLiveTracking`, requestBody, this.httpOptions);
    return response;
  }
  //mostPopularBook: Book = allBooks[0];

  // setMostPopularBook(popularBook: Book): void {
  //   this.mostPopularBook = popularBook;
  // }

  // getAllReaders(): Observable<Reader[]> {
  //   return this.http.get<Reader[]>('/api/readers');
  // }

  // getReaderById(id: number): Observable<Reader> {
  //   return this.http.get<Reader>(`/api/readers/${id}`, {
  //     headers: new HttpHeaders({
  //       'Accept': 'application/json'
  //     })
  //   });
  // }

  // getAllBooks(): Observable<Book[]> {
  //   return this.http.get<Book[]>('/api/books');
  // }

  // private handleHttpError(error: HttpErrorResponse): Observable<BookTrackerError> {
  //   let dataError = new BookTrackerError();
  //   dataError.errorNumber = 100;
  //   dataError.message = error.statusText;
  //   dataError.friendlyMessage = 'An error occurred retrieving data.';
  //   return throwError(dataError);
  // }

  // getBookById(id: number): Observable<Book> {
  //   return this.http.get<Book>(`/api/books/${id}`, {
  //     headers: new HttpHeaders({
  //       'Accept': 'application/json'
  //     })
  //   });
  // }

  // getOldBookById(id: number): Observable<OldBook> {
  //   return this.http.get<Book>(`/api/books/${id}`)
  //     .pipe(
  //       map(b => <OldBook>{
  //         bookTitle: b.title,
  //         year: b.publicationYear
  //       })
  //     )
  // }

  // addBook(newBook: Book): Observable<Book> {
  //   return this.http.post<Book>('/api/books', newBook, {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json'
  //     })
  //   });
  // }

  // updateBook(updatedBook: Book): Observable<void> {
  //   return this.http.put<void>(`/api/books/${updatedBook.bookID}`, updatedBook, {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json'
  //     })
  //   });
  // }

  // deleteBook(bookID: number): Observable<void> {
  //   return this.http.delete<void>(`/api/books/${bookID}`);
  // }

  changeMessage(message: any) {
    debugger;
    this.messageSource.next(message)
  }


}
