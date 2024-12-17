import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { signup, User, changeUserPassword, webSignup } from '../models/user';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  public currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  public companySubscription = new BehaviorSubject(null);
  role: any = new BehaviorSubject('');
  private userIdSubject = new BehaviorSubject<string | null>(null);
  userId$ = this.userIdSubject.asObservable();

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
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const lastLoginTime = parseInt(loginTime, 10);
        const timeElapsed = currentTime - lastLoginTime;

        if (timeElapsed >= twentyFourHours) {
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
    // this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    // this.currentUser = this.currentUserSubject.asObservable();

    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
    const subscription = JSON.parse(localStorage.getItem('subscription'));
    if(subscription) {
      this.companySubscription.next(subscription);
    }
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
        this.companySubscription.next(user.data.companySubscription);
        this.loggedIn.next(true);
        return user;
      }));
  }

  logout(): Promise<void> {
    return new Promise<void>((resolve) => {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('subscription');
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
  webSignup(webSignup: webSignup): Observable<User> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/websignup`, webSignup, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });

  }

  // Generate OTP
  generateOTP(email: any): Observable<User> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/common/generate-otp`, email, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });

  }

  verifyOTP(payload: any): Observable<User> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/common/verify-otp`, payload, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });

  }

  cancelOTP(payload: any): Observable<User> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/common/cancel-otp`, payload, {
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

  getUserTaskListByProject(userId, projectId, skip: string, next: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/task/getUserTaskListByProject`, { userId, projectId, skip, next }, httpOptions)
  }

}