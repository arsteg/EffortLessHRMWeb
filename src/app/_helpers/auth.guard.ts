import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    //     const companyIdCookie = this.getCookie('companyId');
    //     const userIdCookie = this.getCookie('userId');
    
    //     if (companyIdCookie && userIdCookie) {
    //       return true;
    //     } else {
    //       // If cookies are not present, redirect to the login page
    //       return this.router.parseUrl('/login');
    //     }
    //   }
    
    //   private getCookie(name: string): string {
    //     const value = "; " + document.cookie;
    //     const parts = value.split("; " + name + "=");
    //     if (parts.length == 2) return parts.pop()?.split(";").shift() || "";
    //     return "";
    //   }
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) : Observable<boolean> {
      return this.authenticationService.isLoggedIn // {1}
      .pipe(
      take(1), // {2}
      map((isLoggedIn: boolean) => { // {3}

      if (!isLoggedIn){

      //this.router.navigate(['/login']); // {4}
      return true;
    }})
    )

}
}
