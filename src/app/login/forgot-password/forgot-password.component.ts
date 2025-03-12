import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NotificationService } from '../../_services/notification.service';
import { AuthenticationService } from '../../_services/authentication.service';
import { signup } from 'src/app/models/user';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})

export class ForgotPasswordComponent implements OnInit {
  loading = false;
  submitted = false;
  user: signup = new signup();
  @ViewChild('f') forgotPasswordForm: NgForm;

  constructor(
    private authenticationService: AuthenticationService,
    private notifyService: NotificationService) { }

  ngOnInit(): void {
  }
  get f() { return this.forgotPasswordForm.controls; }

  reset() {
    this.submitted = false;
    this.forgotPasswordForm.reset();
  }

  onSubmit() {
    this.submitted = true;
    this.user.email = this.forgotPasswordForm.value.email;
    this.loading = true;
    if (this.forgotPasswordForm.valid) {
      this.authenticationService.forgotPassword(this.user.email).subscribe((res: any) => {
        this.loading = false;
        if (res.status == 'success') {
          this.notifyService.showSuccess("Your Reset password Link send Successfully , Please check your email", "success");
        }
        else if (res.status == 'failure') {
          this.notifyService.showError("There is no user with email address.", "error");
        }
      })
    } else {
      this.loading = false;
    }
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
