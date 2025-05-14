import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { NotificationService } from '../../_services/notification.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { signup } from 'src/app/models/user';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../login.component.css']
})

export class ResetPasswordComponent implements OnInit {
  loading = false;
  resetToken: null;
  CurrentState: any;
  submitted = false;
  user: signup = new signup();
  @ViewChild('f') resetPasswordForm: NgForm;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notifyService: NotificationService) {
    this.route.params.subscribe(params => {
      this.resetToken = params['token'];
    });
  }

  ngOnInit(): void { }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    this.user.password = this.resetPasswordForm.value.password;
    this.user.passwordConfirm = this.resetPasswordForm.value.confirm_password;
    if (this.resetPasswordForm.value.password !== this.resetPasswordForm.value.confirm_password) {
      this.notifyService.showWarning("Passwords don't match", "warning");
      return;
    }
    this.loading = true;
    this.authenticationService.resetPassword(this.user.password, this.user.passwordConfirm, this.resetToken)
      .pipe(first())
      .subscribe(
        data => {
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['login']);
            this.notifyService.showSuccess("Password Link Send Successfully", "success");
          }, 30);
        },
        err => {
          this.errorMessage = err;
          this.loading = false;
          if (err.error) {
            this.notifyService.showError(err.message, "Error");
          }
        }
      );
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
