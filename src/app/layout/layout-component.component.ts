import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, Observable, Subscription } from 'rxjs';
import { signup } from '../models/user';
import { AuthenticationService } from '../_services/authentication.service';


@Component({
  selector: 'app-layout-component',
  templateUrl: 'layout-component.component.html',
  styleUrls: ['layout-component.component.css']
})
export class LayoutComponentComponent implements OnInit {

  isLoggedIn$: Observable<boolean>; 
  name = 'Angular 6';
  menuItems = ['dashboard', 'sales', 'orders', 'customers', 'products'];
  public user: signup=new signup();
  private _router: Subscription;
  private lastPoppedUrl: string;
  private yScrollStack: number[] = [];
   constructor(private route: ActivatedRoute, private router: Router,
    private authenticationService: AuthenticationService,
    ) {     
      if(!localStorage.getItem('currentUser')){
         this.router.navigate(['/login']);
      }
     }


  ngOnInit() {
    this.user=this.authenticationService.currentUserValue["data"].user;  
    if(localStorage.getItem('currentUser')){    
      this.isLoggedIn$ = this.authenticationService.isLoggedIn;
      }
     }
}
