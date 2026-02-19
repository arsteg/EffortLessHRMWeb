import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../_services/authentication.service';
import { signup } from '../models/user';
import { throwError } from 'rxjs';
import { PreferenceService } from '../_services/user-preference.service';
import { PreferenceKeys } from '../constants/preference-keys.constant';

import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
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
  selectedAppMode: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private translate: TranslateService,
    private preferenceService: PreferenceService
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

      this.authenticationService.login(this.loginForm.value).subscribe
        (data => {
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
            this.user.isTrial = data.data.user?.trialInfo?.isTrial;
            this.user.daysLeft = data.data.user?.trialInfo?.daysLeft;
            localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(this.user));
            localStorage.setItem('rememberMe', JSON.stringify(this.loginForm.value.rememberMe));
            localStorage.setItem('role', data.data.user?.role?.name);
            localStorage.setItem('subscription', JSON.stringify(data.data.companySubscription));

            // Check for existing AppMode preference
            this.preferenceService.getPreferencesByUserId(this.user.id).subscribe({
              next: (response) => {
                const roleName = data.data.user?.role?.name?.toLowerCase();
                const preferences = response.data?.preferences || [];
                const appModePreference = preferences.find(pref =>
                  pref.preferenceOptionId &&
                  typeof pref.preferenceOptionId !== 'string' &&
                  pref.preferenceOptionId.preferenceKey === PreferenceKeys.AppMode
                );

                if (roleName === 'user') {
                  this.selectedAppMode = 'user';
                } else if (appModePreference && typeof appModePreference.preferenceOptionId !== 'string') {
                  this.selectedAppMode = appModePreference.preferenceOptionId.preferenceValue;
                } else {
                  this.selectedAppMode = roleName === 'admin' ? 'admin' : 'user';
                }
                // Store the selected AppMode
                this.createUserPreference(this.user.id, PreferenceKeys.AppMode, this.selectedAppMode);
              },
              error: (error) => {
                //console.error('Error fetching preferences:', error);
                const roleName = data.data.user?.role?.name?.toLowerCase();
                this.selectedAppMode = roleName === 'user' ? 'user' : (roleName === 'admin' ? 'admin' : 'user');
                this.createUserPreference(this.user.id, PreferenceKeys.AppMode, this.selectedAppMode);
              }
            });
          }
        },
          (err) => {
            this.loading = false;
            const errorMessage = err?.error?.message || err?.message || err
              || this.translate.instant('login.unable_login')
              ;

            this.toast.error(errorMessage, 'Error!');
          });
    }
    else {
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

  createUserPreference(userId: string, preferenceKey: string, preferenceValue: string) {
    this.preferenceService.createOrUpdatePreference(
      userId,
      preferenceKey,
      preferenceValue
    ).subscribe();

    localStorage.setItem('adminView', this.selectedAppMode);
    const defaultUrl = this.selectedAppMode === 'user' ? 'home/dashboard/user' : this.returnUrl;
    const selectedPlanId = localStorage.getItem('landingPageSelectedPlanId');
    if (selectedPlanId) {
      const subscription = JSON.parse(localStorage.getItem('subscription') || 'null');
      const hasExistingSubscription = ['active', 'authenticated', 'created'].includes(subscription?.status);
      if (hasExistingSubscription) {
        localStorage.removeItem('landingPageSelectedPlanId');
        this.router.navigateByUrl(defaultUrl);
      } else {
        this.router.navigate(['/subscription/plans']);
      }
    } else {
      this.router.navigateByUrl(defaultUrl);
    }
  }
} 