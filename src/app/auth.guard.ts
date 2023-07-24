import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './_services/authentication.service'; 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthenticationService, private router: Router) {}

  // canActivate(
  //   next: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //     if (this.authService.isLoggedIn()) {
  //       return true;
  //     } else {
  //       this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  //       return false;
  //     }
  // }
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
}
