import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthenticationService } from './_services/authentication.service'; 
import { ToastrService } from 'ngx-toastr';
import { Role } from './models/role.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  private isProcessing: boolean = false;
  private pendingPromise: Promise<boolean | UrlTree> | null = null;
  constructor(private authService: AuthenticationService, private router: Router, private toastrService: ToastrService) {
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    if (this.isProcessing && this.pendingPromise) {
      return this.pendingPromise;
    }
    this.isProcessing = true;
    this.pendingPromise = this.processActivation(next, state);
    try {
      const result = await this.pendingPromise;
      return result;
    } finally {
      // Reset the lock and promise
      this.isProcessing = false;
      this.pendingPromise = null;
    }
}

private async processActivation(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
  const loggedIn = await this.authService.isLoggedIn();
  if (!loggedIn) {
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const subscription = this.authService.companySubscription.getValue();
  const user = this.authService.currentUserSubject.getValue();
  const subscriptionActive = ['active', 'authenticated'];

  //if (!subscriptionActive.includes(subscription?.status) && !user.freeCompany) {
  if (!subscriptionActive.includes(subscription?.status) && !user?.isTrial) {
    this.router.navigate(['/subscription/plans']);
    return false;
  }

  let userRole = user?.role;
  const appView = this.authService.getAppView();
  if (appView?.trim() === 'user' && userRole === Role.Admin) {
    userRole = Role.User;
  }

  //const currentMenuName = next.data['permission'];
  const currentMenuName = this.getPermissionFromRoute(next);
  if (!currentMenuName || currentMenuName.trim() === '') {
    this.toastrService.error("You are not authorized to access.");
    return false;
  }

  try {
    const hasAccess = currentMenuName.toLowerCase() === 'home'
      || await firstValueFrom(this.authService.isMenuAccessible(currentMenuName, userRole));

    if (!hasAccess) {
      this.toastrService.error(`You are not authorized to access ${currentMenuName}.`);
      return this.redirectToDashboardOrLogin(loggedIn, appView);
    }
    return hasAccess;
    // const hasAccess = await firstValueFrom(this.authService.isMenuAccessible(currentMenuName, userRole));
    // if(hasAccess || currentMenuName.toLowerCase() === 'home'){
    //   return true;
    // }
    // else{
    //   this.toastrService.error("You are not authorized to access this page.");
    //   return false;
    // }
  } catch (error) {
    this.isProcessing = false;
    this.toastrService.error(`You are not authorized to access ${currentMenuName}.`);
    return this.redirectToDashboardOrLogin(loggedIn, appView);
    //return false;
  }
  // finally {
  //   this.isProcessing = false;
  // }
 }

 private redirectToDashboardOrLogin(loggedIn: boolean, appView: string): boolean | UrlTree {
    if (!loggedIn) {
      //return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: this.router.url } });
      this.router.navigate(['/login']);
      return true;
    }
    else{
      const dashboardUrl = appView?.trim() === 'user' ? '/home/dashboard/user' : '/home/dashboard';
      this.router.navigate([dashboardUrl]);
      return true;
    }
  }

  private getPermissionFromRoute(next: ActivatedRouteSnapshot): string | undefined {
    const findPermissionInChildren = (route: ActivatedRouteSnapshot): string | undefined => {
      if (route.data['permission']) {
        return route.data['permission'];
      }
      for (const child of route.children) {
        const permission = findPermissionInChildren(child);
        if (permission) {
          return permission;
        }
      }
      return "";
    };

    let permission = findPermissionInChildren(next);

    if (!permission) {
      let currentRoute: ActivatedRouteSnapshot | null = next.parent;
      while (currentRoute) {
        if (currentRoute.data['permission']) {
          return currentRoute.data['permission'];
        }
        currentRoute = currentRoute.parent;
      }
    }

    return permission || '';
  }
}