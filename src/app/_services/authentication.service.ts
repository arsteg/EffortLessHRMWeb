import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { signup, User, changeUserPassword } from '../models/user';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';


@Injectable({ providedIn: 'root' })

export class AuthenticationService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  private getHttpOptions() {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    });
    const httpOptions = { headers, withCredentials: true };
    return httpOptions;
  }
  private defaultHttpOptions() {  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    const httpOptions = { headers, withCredentials: true };
    return httpOptions;
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwtToken');
  }
  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const companyIdCookie = this.getCookie('companyId');
    const userIdCookie = this.getCookie('userId');

    if (companyIdCookie && userIdCookie) {
      return true;
    } else {
      // If cookies are not present, redirect to the login page
      return this.router.parseUrl('/login');
    }
  }

  private getCookie(name: string): string {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop()?.split(";").shift() || "";
    return "";
  }
  
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  forgotPassword(email) {
    var queryHeaders = new HttpHeaders();
    queryHeaders.append('Content-Type', 'application/json');
    queryHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/forgotpassword`, { email: email }, { headers: queryHeaders });

  }
  resetPassword(password, confirm_password, token) {
    var qureyParams = new HttpParams();
    qureyParams.append("token", token);
    var queryHeaders = new HttpHeaders();
    queryHeaders.append('Content-Type', 'application/json');
    queryHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.patch<any>(`${environment.apiUrlDotNet}/users/resetPassword/${token}`, { password: password, passwordConfirm: confirm_password }, { headers: queryHeaders });
  }
  login(user) {
    const httpOptions = this.defaultHttpOptions();
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/login`, { email: user.email, password: user.password }, httpOptions)
      .pipe(map(user => {
        this.currentUserSubject.next(user);
        this.loggedIn.next(true);
        return user;
      }));
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.loggedIn.next(false);
  }

  signup(signup: signup): Observable<User> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/signup`, signup, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });

  }

  GetMe(id: string): Observable<signup[]> {
    const httpOptions = this.getHttpOptions();
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/me`, { id }, httpOptions);

  }

  changePassword(user: changeUserPassword): Observable<User> {
    return this.http.patch<any>(`${environment.apiUrlDotNet}/users/updateMyPassword`, user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  getRole(id): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/auth/role/${id}`, httpOptions)
  }
  getUserManagers(id): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/users/getUserManagers/${id}`, httpOptions)
  }
  getUserProjects(id): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/users/getUserProjects/${id}`, httpOptions)
  }

  getUserTaskListByProject(userId,projectId, skip: string, next: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/task/getUserTaskListByProject`,{userId,projectId, skip, next}, httpOptions)
  }

}