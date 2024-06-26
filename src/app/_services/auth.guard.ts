// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

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
