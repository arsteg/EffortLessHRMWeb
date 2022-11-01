// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
// import { filter, Observable, Subscription } from 'rxjs';
// import { signup } from '../models/user';
// import { AuthenticationService } from '../_services/authentication.service';


// @Component({
//   selector: 'app-layout-component',
//   templateUrl: 'layout-component.component.html',
//   styleUrls: ['layout-component.component.css']
// })
// export class LayoutComponentComponent implements OnInit {

//   isLoggedIn$: Observable<boolean>;
//   public user: signup=new signup();
//   constructor(private router: Router,
//   private authenticationService: AuthenticationService,
//     )
//      {
//       if(!localStorage.getItem('currentUser')){
//          this.router.navigate(['/login']);
//       }
//      }

//  ngOnInit() {
//     //this.user=this.authenticationService.currentUserValue["data"].user;
//     this.isLoggedIn$ = this.authenticationService.isLoggedIn;
//      }

//      signOut(){
//       this.authenticationService.logout();
//       this.router.navigate(['/login']);
//      }
// }
