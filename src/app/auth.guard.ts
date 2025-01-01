import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './_services/authentication.service'; 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  constructor(private authService: AuthenticationService, private router: Router) {}

    canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    return this.authService.isLoggedIn().then((loggedIn) => {
      if (loggedIn) {
        const subscription = this.authService.companySubscription.getValue();
        const user = this.authService.currentUserSubject.getValue();
        console.log('uer',user)

        if(subscription?.status !== 'active' && !user.freeCompany) {
           this.router.navigate(['/subscription']);
           return true;
        }
        return true;
      } else {
        return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      }
    });
  }
 
}
