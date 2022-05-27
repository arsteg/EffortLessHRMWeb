import { Component, OnInit,Input, ViewChild} from '@angular/core';
import { Router,ActivatedRoute  } from '@angular/router';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
//import {slideToTop} from '../router.animations'
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../_services/authentication.service';
import { NotificationService } from '../_services/notification.service';
import { signup, User } from '../models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit { 

  loading = false;
  submitted = false;
  returnUrl: string;
  user:signup= new signup();
  @ViewChild('f') loginForm: NgForm;

  constructor( private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notifyService : NotificationService) {if (this.authenticationService.currentUserValue) {
      //this.router.navigate(['/']);
  }
}
  ngOnInit(): void { 
  // get return url from route parameters or default to '/'
  this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
 
  onSubmit() {
  {
    this.submitted = true;  
    this.loading = true;
    this.user.email=this.loginForm.value.username;
    this.user.password=this.loginForm.value.password;   
    this.authenticationService.login(this.user.email, this.user.password)
      .pipe(first())
        .subscribe(
            data => {
              this.loading = false;
                this.router.navigate([this.returnUrl]);
            },
            err => {
              this.notifyService.showError(err.message, "Error")
                this.loading = false;
            });
     }
  }
}
