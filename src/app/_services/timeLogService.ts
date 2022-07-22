import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { company } from '../models/company';
import { environment } from 'src/environments/environment';
import { timeLog } from '../models/timeLog';
import {response} from '../models/response'


@Injectable({
  providedIn: 'root'
})
export class TimeLogService {

  constructor(private http: HttpClient) { }

  getCompanyList(): Observable<company> {
    return this.http.get<company>(`/api/books`)
      .pipe(
        map(b => <company>{
        })
      )
  }

  getLogsWithImages(email, selectedDate): Observable<response<timeLog[]>> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxZGMyMzhjZjE1MmM0YmU4MTQwMmNjMiIsImlhdCI6MTY1NzgxMjU4NywiZXhwIjoxNjY1NTg4NTg3fQ.ewCl3BxgDOI8O2VIjBbCGLWQwb4gFIqos73n6Vz0WsA'})
    };
    var response  = this.http.post<response<timeLog[]>>(`${environment.apiUrlDotNet}/timeLogs/getLogsWithImages`,{
      "user":email,
      "date":selectedDate
   }, httpOptions);
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

}
