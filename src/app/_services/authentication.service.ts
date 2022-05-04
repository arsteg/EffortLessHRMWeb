import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { environment } from 'src/environments/environment';
import { User } from '../models/user';

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

    login(username, password) {
        debugger;
        const params = new HttpParams();
        params.set('email', username);
        params.set('password', password);    
        var queryHeaders = new HttpHeaders();
        queryHeaders.append('Content-Type', 'application/json');
        queryHeaders.append('Access-Control-Allow-Origin','*');
      
       // alert(`${environment.apiUrlDotNet}/users/login?email=${username}&password=${password}`);
        return this.http.post<any>(`${environment.apiUrlDotNet}/users/login`, params,{ headers: queryHeaders})
            .pipe(map(user => {
                alert("called");
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
}