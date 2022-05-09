import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { signup, User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }
    forgotPassword(email)
    {
        var queryHeaders = new HttpHeaders();
        queryHeaders.append('Content-Type', 'application/json');
        queryHeaders.append('Access-Control-Allow-Origin','*');
        return this.http.post<any>(`${environment.apiUrlDotNet}/users/forgotpassword`, {email:email},{ headers: queryHeaders});

    }
    resetPassword(password,confirm_password,token)
    {
        var qureyParams=new HttpParams();
        qureyParams.append("token",token);
        var queryHeaders = new HttpHeaders();
        queryHeaders.append('Content-Type', 'application/json');
        queryHeaders.append('Access-Control-Allow-Origin','*');
        return this.http.patch<any>(`${environment.apiUrlDotNet}/users/resetpassword/${token}`, {password:password,passwordConfirm:confirm_password},{ headers: queryHeaders});

    }
    login(username, password) {
        var queryHeaders = new HttpHeaders();
        queryHeaders.append('Content-Type', 'application/json');
        queryHeaders.append('Access-Control-Allow-Origin','*');
        return this.http.post<any>(`${environment.apiUrlDotNet}/users/login`, {email:username,password:password},{ headers: queryHeaders})
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    signup(signup: signup): Observable<User> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/signup`, signup, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }
}
