import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { signup, User, changeUserPassword, webSignup } from '../models/user';
import { Router } from '@angular/router';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  public currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  public companySubscription = new BehaviorSubject(null);
  role: any = new BehaviorSubject('');
  private userIdSubject = new BehaviorSubject<string | null>(null);
  userId$ = this.userIdSubject.asObservable();
  private menuPermissionsSubject = new BehaviorSubject<string[] | null>(null);
  private lastCheckedRole: string | null = null;

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
      const storedUserRole = localStorage.getItem('role');
      if (storedUserRole) {
        storedUser.role = storedUserRole;
      }
      this.currentUserSubject.next(storedUser);
    }
    const subscription = JSON.parse(localStorage.getItem('subscription'));
    if (subscription) {
      this.companySubscription.next(subscription);
    }

    // Load cached permissions
    const cachedPermissions = localStorage.getItem('cachedPermissions');
    const cachedRole = localStorage.getItem('cachedRole');
    if (cachedPermissions && cachedRole) {
      this.menuPermissionsSubject.next(JSON.parse(cachedPermissions));
      this.lastCheckedRole = cachedRole;
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
  resetPassword(password, confirm_password, token): Observable<any> {
    const httpOptions = this.defaultHttpOptions();
    return this.http.patch<any>(`${environment.apiUrlDotNet}/users/resetPassword/${token}`, { password: password, passwordConfirm: confirm_password }, httpOptions);
  }

  login(user) {
    const httpOptions = this.defaultHttpOptions();
    const loginTime = new Date().getTime();
    localStorage.setItem('loginTime', loginTime.toString());
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/login`, { email: user.email, password: user.password }, httpOptions)
      .pipe(map(user => {

        this.currentUserSubject.next(
          {
            firstName: user.data.user.firstName,
            id: user.data.user.id,
            lastName: user.data.user.lastName,
            freeCompany: user.data.user.company.freeCompany,
            empCode: user.data.user.appointment?.[0]?.empCode,
            role: user.data.user.role.name.toLowerCase() == "admin" ? Role.Admin : Role.User,
            isTrial: user.data.user.trialInfo?.isTrial,
            daysLeft: user.data.user.trialInfo?.daysLeft
          }
        );
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

      localStorage.removeItem('cachedPermissions');
      localStorage.removeItem('cachedRole');
      this.menuPermissionsSubject.next(null);
      this.lastCheckedRole = null;

      // Perform any other necessary logout logic

      this.loginTime = null; // Reset the loginTime in memory
      this.currentUserSubject.next(null);
      this.loggedIn.next(false);
      this.router.navigate(['/login']);
      resolve();
    });
  }

  getAppView() {
    return localStorage.getItem('adminView');
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

  // Roles
  getRoles(): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/auth/roles`, httpOptions);
  }

  getRoleById(id: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/auth/role/${id}`, httpOptions);
  }

  createRole(role: { name: string; description: string }): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/auth/role`, role, httpOptions);
  }

  updateRole(id: string, role: { name: string; description: string }): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/auth/role/update/${id}`, role, httpOptions);
  }

  deleteRole(id: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.delete(`${environment.apiUrlDotNet}/auth/role/${id}`, httpOptions);
  }

  // Permissions
  getPermissions(): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/auth/permissions`, httpOptions);
  }

  getPermissionById(id: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/auth/permission/${id}`, httpOptions);
  }

  createPermission(permission: {
    permissionName: string;
    permissionDetails?: string;
    resource: string;
    action: string;
    uiElement?: string;
    parentPermission?: string;
  }): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/auth/permission/create`, permission, httpOptions);
  }

  updatePermission(id: string, permission: {
    permissionName: string;
    permissionDetails?: string;
    resource: string;
    action: string;
    uiElement?: string;
    parentPermission?: string;
  }): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/auth/permission/update/${id}`, permission, httpOptions);
  }

  deletePermission(id: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.delete(`${environment.apiUrlDotNet}/auth/permission/delete/${id}`, httpOptions);
  }

  // UserRoles
  getUserRoles(): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/auth/userRolesv1`, httpOptions);
  }

  getUserRoleById(id: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/auth/userRole/${id}`, httpOptions);
  }

  createUserRole(userRole: { userId: string; roleId: string }): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/auth/userRole/createuserrolev1`, userRole, httpOptions);
  }

  updateUserRole(id: string, userRole: { userId: string; roleId: string }): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/auth/userRole/updateuserrole/${id}`, userRole, httpOptions);
  }

  deleteUserRole(id: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.delete(`${environment.apiUrlDotNet}/auth/userRole/deleteuserrole/${id}`, httpOptions);
  }

  // RolePermissions
  getRolePermissions(): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/auth/rolePermissions`, httpOptions);
  }

  getPermissionsByRole(roleName: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    const url = `${environment.apiUrlDotNet}/auth/rolePermissions/by-role?roleName=${encodeURIComponent(roleName)}`;
    return this.http.get(url, httpOptions);
  }

  isMenuAccessible(menuName: string, roleName: string): Observable<boolean> {
    const menu = menuName.toLowerCase();

    // Check if we have valid cached permissions for this role
    if (this.lastCheckedRole === roleName && this.menuPermissionsSubject.value) {
      const hasAccess = this.menuPermissionsSubject.value.some(p => p.toLowerCase() === menu);
      return of(hasAccess);
      // Using BehaviorSubject here just to return an Observable consistent with the signature
      // or simply of(hasAccess) if we imported 'of'
    }

    // If not in cache or role changed, fetch from API
    return this.getPermissionsByRole(roleName).pipe(
      map((response: any) => {
        const permissions = response?.data;
        if (Array.isArray(permissions)) {
          // Update Cache
          this.menuPermissionsSubject.next(permissions);
          this.lastCheckedRole = roleName;
          localStorage.setItem('cachedPermissions', JSON.stringify(permissions));
          localStorage.setItem('cachedRole', roleName);

          return permissions.some((p: string) => p.toLowerCase() === menu);
        }
        return false;
      })
    );
  }

  getRolePermissionById(id: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.get(`${environment.apiUrlDotNet}/auth/rolePermission/${id}`, httpOptions);
  }

  createRolePermission(rolePermission: { roleId: string; permissionId: string }): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/auth/rolePermission/create`, rolePermission, httpOptions);
  }

  updateRolePermission(id: string, rolePermission: { roleId: string; permissionId: string }): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.post(`${environment.apiUrlDotNet}/auth/rolePermission/update/${id}`, rolePermission, httpOptions);
  }

  deleteRolePermission(id: string): Observable<any> {
    const httpOptions = this.getHttpOptions();
    return this.http.delete(`${environment.apiUrlDotNet}/auth/rolePermission/delete/${id}`, httpOptions);
  }

}