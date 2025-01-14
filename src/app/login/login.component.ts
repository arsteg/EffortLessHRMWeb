import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, FormGroup, NgForm, Validators, FormBuilder } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../_services/authentication.service';
import { signup } from '../models/user';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  rememberMe: boolean = false;
  loading = false;
  submitted = false;
  returnUrl: string;
  user: signup = new signup();
  loginForm: FormGroup;
  inValidForm: boolean;
  hidePassword: boolean = true;


  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    })
  }
  ngOnInit(): void {

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigateByUrl('login');
    }
    this.loginForm.controls['rememberMe'].setValue(localStorage.getItem('rememberMe') == 'true');

  }

  onSubmit() {
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      this.loading = true;
      this.authenticationService.login(this.loginForm.value).pipe(
        catchError(err => {
          if (err.status === 400 || err.status === 401) {
            this.inValidForm = true;
          }
          this.loading = false;
          return throwError(err);
        })
      )
        .subscribe(
          (data: any) => {
            this.loading = true;
            if (!data) {
              this.loading = false;
              this.inValidForm = true;
            } else {
              this.loading = true;
              this.user.id = data.data.user.id;
              this.user.firstName = data.data.user.firstName;
              this.user.lastName = data.data.user.lastName;
              this.user.freeCompany = data.data.user.company.freeCompany;
              localStorage.setItem('jwtToken', data.token);
              localStorage.setItem('currentUser', JSON.stringify(this.user));
              localStorage.setItem('rememberMe', JSON.stringify(this.loginForm.value.rememberMe));
              localStorage.setItem('roleId', data.data.user?.role?.id);
              localStorage.setItem('subscription', JSON.stringify(data.data.companySubscription));
    
              const desiredUrl = this.route.snapshot.queryParams['redirectUrl'];
              if (data.data.user?.role?.id === '639acb77b5e1ffe22eaa4a39') {
                localStorage.setItem('adminView', 'admin');
                this.router.navigateByUrl(this.returnUrl || 'home/dashboard');
              } else {
                localStorage.setItem('adminView', 'user');
                this.router.navigateByUrl(this.returnUrl || 'home/dashboard/user');
              }
            }
          },
          err => {
            console.error(err);
            this.loading = false;
          }
        )
    }
    else{this.loginForm.markAllAsTouched()}
  }
  
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
