import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthenticationService } from './_services/authentication.service'; 
import { ToastrService } from 'ngx-toastr';
import { Role } from './models/role.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  constructor(private authService: AuthenticationService, private router: Router, private toastrService: ToastrService) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
  const loggedIn = await this.authService.isLoggedIn();
  if (!loggedIn) {
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const subscription = this.authService.companySubscription.getValue();
  const user = this.authService.currentUserSubject.getValue();
  const subscriptionActive = ['active', 'authenticated'];

  if (!subscriptionActive.includes(subscription?.status) && !user.freeCompany) {
    this.router.navigate(['/subscription/plans']);
    return false;
  }

  let userRole = user?.role;
  const appView = this.authService.getAppView();
  if (appView?.trim() === 'user' && userRole === Role.Admin) {
    userRole = Role.User;
  }

  const currentMenuName = next.data['permission'];
  try {
    const hasAccess = await firstValueFrom(this.authService.isMenuAccessible(currentMenuName, userRole));
    if(hasAccess || currentMenuName.toLowerCase() === 'home'){
      return true;
    }
    else{
      this.toastrService.error("You are not authorized to access this page.");
      return false;
    }
  } catch (error) {
    this.toastrService.error("You are not authorized to access this page.");
    return false;
  }
 }
}
