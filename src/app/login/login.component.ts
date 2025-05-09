import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, FormGroup, Validators, FormBuilder } from '@angular/forms';
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
  errorMessage: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || 'home/dashboard';
    });
    this.loginForm.controls['rememberMe'].setValue(localStorage.getItem('rememberMe') == 'true');
  }

  onSubmit() {
    this.errorMessage = null;
    if (this.loginForm.valid) {
      this.loading = true;
      this.authenticationService.login(this.loginForm.value).pipe(
        catchError(err => {
          this.loading = false;
          if (err === 'Unauthorized') {
            this.errorMessage = 'Authentication failed. Invalid email or password.';
          } else {
            this.errorMessage = 'An unexpected error occurred.';
          }
          return throwError(err);
        })
      ).subscribe(data => {
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
          this.user.empCode = data.data.user?.appointment[0]?.empCode;
          localStorage.setItem('jwtToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify(this.user));
          localStorage.setItem('rememberMe', JSON.stringify(this.loginForm.value.rememberMe));
          localStorage.setItem('role', data.data.user?.role?.name);
          localStorage.setItem('subscription', JSON.stringify(data.data.companySubscription));
          if (data.data.user?.role?.name === 'Admin') {
            localStorage.setItem('adminView', 'admin');
            this.router.navigateByUrl( this.returnUrl);
          } else {
            localStorage.setItem('adminView','user');
            this.router.navigateByUrl(this.returnUrl);
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields.';
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
} 