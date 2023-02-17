import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { company } from '../models/company';
import { environment } from 'src/environments/environment';
import { timeLog } from '../models/timeLog';
import {response} from '../models/response'
import { baseService } from './base';
import { User } from '../models/user';
import { stringToArray } from 'ag-grid-community';

@Injectable({
  providedIn: 'root'
})
export class TimeLogService extends baseService {

  private messageSource = new BehaviorSubject<any>(0);
  currentMessage = this.messageSource.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

  getCompanyList(): Observable<company> {
    return this.http.get<company>(`/api/books`)
      .pipe(
        map(b => <company>{
        })
      )
  }

  getLogsWithImages(email, selectedDate): Observable<response<timeLog[]>> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.post<response<timeLog[]>>(`${environment.apiUrlDotNet}/timeLogs/getLogsWithImages`,{
      "user":email,
      "date":selectedDate
   }, httpOptions);
   return response;
  }
  getCurrentWeekTotalTime(email, startDate, endDate): Observable<response<timeLog[]>> {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };
    var response  = this.http.post<response<timeLog[]>>(`${environment.apiUrlDotNet}/timeLogs/getCurrentWeekTotalTime`,{
      "user":email,
      "startDate":startDate,
      "endDate":endDate,
   }, httpOptions);
   return response;
  }


  getTeamMembers(userId): any {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };

    // const params = new HttpParams().set('userId', userId);

    var response  = this.http.get<any>(`${environment.apiUrlDotNet}/auth/roles/getSubordinates/${userId}`, httpOptions);
   return response;

  }

  getusers(ids): any {
    let token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': `Bearer ${token}`})
    };


    var response  = this.http.post<any>(`${environment.apiUrlDotNet}/users/getUsers`,{"userId":ids},httpOptions);

   return response;

  }

  deletetimelog(logs:any):Observable<timeLog>{
    let token = localStorage.getItem('jwtToken');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${token}`
      }),
      body: logs
    }

    return this.http.delete<timeLog>(`${environment.apiUrlDotNet}/timelogs`, httpOptions);
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
