import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { signup, User, changeUserPassword } from '../models/user';
import { Router } from '@angular/router';

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
  private loginTime: number | null = null;


isLoggedIn(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
      const currentTime = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const lastLoginTime = parseInt(loginTime, 10);
      const timeElapsed = currentTime - lastLoginTime;

      if (timeElapsed >= twentyFourHours) {
        // Auto logout after 24 hours
        this.logout().then(() => resolve(false));
      } else {
        resolve(true);
      }
    } else {
      resolve(false);
    }
  });
}
  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
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
    const loginTime = new Date().getTime();
    localStorage.setItem('loginTime', loginTime.toString());
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/login`, { email: user.email, password: user.password }, httpOptions)
      .pipe(map(user => {
       
        this.currentUserSubject.next(user);
        this.loggedIn.next(true);
        return user;
      }));
  }
 
  logout(): Promise<void> {
    return new Promise<void>((resolve) => {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('roleId');
      localStorage.removeItem('loginTime');
    
      // Perform any other necessary logout logic
  
      this.loginTime = null; // Reset the loginTime in memory
      this.currentUserSubject.next(null);
      this.loggedIn.next(false);
      this.router.navigate(['/login']);
      resolve();
    });
  }
  
  redirectToLogin() {
    this.router.navigate(['/login']);
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