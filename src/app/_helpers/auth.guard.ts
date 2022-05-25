import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) : Observable<boolean> {
        return this.authenticationService.isLoggedIn // {1}
        .pipe(
        take(1), // {2}
        map((isLoggedIn: boolean) => { // {3}
           
        if (!isLoggedIn){
          
        this.router.navigate(['/login']); // {4}
        return false;
        }
       
        return true;
        })
        )
       
    }
}