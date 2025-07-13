import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { NotificationService } from '../../_services/notification.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../login.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  resetToken: string | null = null;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
      private translate: TranslateService,
    private notifyService: NotificationService,
    private fb: FormBuilder
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, CustomValidators.strongPasswordValidator]],
        passwordConfirm: ['', [Validators.required]]
      },
      { validator: CustomValidators.passwordMatchValidator }
    );

    this.route.params.subscribe(params => {
      this.resetToken = params['token'];
    });
  }

  ngOnInit(): void {
    // Log initial form state for debugging
    console.log('Initial form state:', {
      value: this.resetPasswordForm.value,
      valid: this.resetPasswordForm.valid,
      errors: this.resetPasswordForm.errors
    });
  }

  onSubmit() {
    this.resetPasswordForm.markAllAsTouched(); // Show all validation errors
    this.errorMessage = '';

    if (this.resetPasswordForm.invalid) {
      const invalidFields = Object.keys(this.resetPasswordForm.controls).filter(
        key => this.resetPasswordForm.get(key)?.invalid
      );
      console.log('Submission failed. Invalid fields:', invalidFields, this.resetPasswordForm.value, this.resetPasswordForm.errors);
      this.notifyService.showWarning(this.translate.instant('login.reset_form_correct_error'), 'Validation Error');
      return;
    }

    this.loading = true;
    this.authenticationService
      .resetPassword(this.resetPasswordForm.value.password, this.resetPasswordForm.value.passwordConfirm, this.resetToken)     
      .subscribe
        (data => {
          this.loading = false;
          this.router.navigate(['login']);
          this.notifyService.showSuccess(this.translate.instant('login.reset_password_success'), 'Success');
        },
        (err) => {
          this.loading = false;
     
      const errorMessage = err?.error?.message || err?.message || err 
      || this.translate.instant('login.failed_reset_password')
      ;
      this.notifyService.showError( errorMessage,  "Error");
      })
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}