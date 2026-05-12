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
  private pendingPromise: Promise<boolean> | null = null;
  constructor(private authService: AuthenticationService, private router: Router, private toastrService: ToastrService) {
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
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
  ): Promise<boolean> {
  const loggedIn = await this.authService.isLoggedIn();
  debugger;
  if (!loggedIn) {
    // Capture the intended URL - use state.url, fallback to current router url
    const intendedUrl = state.url && state.url !== '/' && state.url !== '/login' ? state.url : this.router.url;

    // For hash routing, navigate directly instead of returning UrlTree
    if (intendedUrl && intendedUrl !== '/login' && intendedUrl !== '/') {
      console.log('Auth Guard - Redirecting to login with returnUrl:', intendedUrl);
      await this.router.navigate(['/login'], { queryParams: { returnUrl: intendedUrl } });
    } else {
      console.log('Auth Guard - Redirecting to login without returnUrl');
      await this.router.navigate(['/login']);
    }
    return false;
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
      return await this.redirectToDashboardOrLogin(loggedIn, appView, state.url);
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
    return await this.redirectToDashboardOrLogin(loggedIn, appView, state.url);
    //return false;
  }
  // finally {
  //   this.isProcessing = false;
  // }
 }

 private async redirectToDashboardOrLogin(loggedIn: boolean, appView: string, returnUrl?: string): Promise<boolean> {
    if (!loggedIn) {
      const urlToReturn = returnUrl || this.router.url;
      if (urlToReturn && urlToReturn !== '/login' && urlToReturn !== '/') {
        await this.router.navigate(['/login'], { queryParams: { returnUrl: urlToReturn } });
      } else {
        await this.router.navigate(['/login']);
      }
      return false;
    }
    else{
      // User is logged in but doesn't have permission - redirect to dashboard
      const dashboardUrl = appView?.trim() === 'user' ? '/home/dashboard/user' : '/home/dashboard';
      await this.router.navigate([dashboardUrl]);
      return false; // Prevent access to unauthorized route
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