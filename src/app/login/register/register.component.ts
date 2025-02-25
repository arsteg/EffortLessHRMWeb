import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { NotificationService } from '../../_services/notification.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  loading = false;
  registerNewUser: FormGroup;
  otpGenerated: boolean = false;
  otp: string = '';
  otpVerified: boolean = false;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private notifyService: NotificationService,
    private toast: ToastrService,
    private fb: FormBuilder
  ) {
    this.registerNewUser = this.fb.group({
      firstName: ['', [Validators.required, this.noSpacesNumbersOrSymbolsValidator]],
      lastName: ['', [this.noSpacesNumbersOrSymbolsValidator]],
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required, Validators.minLength(8)]],
      companyName: ['']
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('passwordConfirm')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  noSpacesNumbersOrSymbolsValidator(control: any) {
    const value = control.value;
    if (/\d/.test(value) || /\s/.test(value) || /[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return { invalidName: true };
    }
    return null;
  }

  onGenerateOTP() {
    let emailControl = this.registerNewUser.get('email');
    if (emailControl.valid) {
      let email = emailControl.value;
      this.authenticationService.generateOTP({ email }).subscribe(
        () => {
          this.loading = true;
          this.toast.success('OTP sent to your email', 'Success');
          this.loading = false;
          this.otpGenerated = true;
        },
        (error) => {
          this.notifyService.showError(error.message, 'Error');
        }
      );
    } else {
      emailControl.markAllAsTouched();
    }
  }

  onReGenerateOTP() {
    this.otpVerified = false;
    this.loading = true;
    this.onGenerateOTP();
  }

  onVerifyOTP() {
    const payload = {
      email: this.registerNewUser.get('email').value,
      otp: this.registerNewUser.get('otp').value,
    };
    this.authenticationService.verifyOTP(payload).subscribe(
      () => {
        this.notifyService.showSuccess('OTP verified successfully', 'Success');
        this.otpVerified = true;
      },
      (error) => {
        this.notifyService.showError('OTP is not Verified', 'Error');
      }
    );
  }

  // onCancelOTP() {
  //   const payload = {
  //     email: this.registerNewUser.get('email').value,
  //     otp: this.registerNewUser.get('otp').value,
  //   };
  //   this.authenticationService.cancelOTP(payload).subscribe(
  //     () => {
  //       this.notifyService.showSuccess('OTP cancelled', 'Success');
  //       this.otpGenerated = false;
  //       this.otpVerified = false;
  //       this.registerNewUser.get('otp').reset();
  //     },
  //     (error) => {
  //       this.notifyService.showError(error.message, 'Error');
  //     }
  //   );
  // }

  onSubmit() {
    if (!this.otpVerified) {
      this.notifyService.showWarning("Please verify the OTP before registering the Company", "Warning");
      return;
    }
    if (this.registerNewUser.value.password !== this.registerNewUser.value.passwordConfirm) {
      this.notifyService.showWarning("Passwords don't match", "Warning");
      return;
    }
    if (this.registerNewUser.valid) {
      this.loading = true;
      this.authenticationService.webSignup(this.registerNewUser.value).subscribe(
        data => {
          setTimeout(() => {
            this.notifyService.showSuccess("User Created Successfully", "Success");
            this.router.navigate(['/login']);
            this.loading = false;
          }, 300);
        },
        err => {
          this.notifyService.showError(err.message, "Error");
          if (err.message) {
            this.loading = false;
          }
        }
      );
    } else {
      this.registerNewUser.markAllAsTouched();
    }
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
