import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { signup, webSignup } from '../../models/user'
import { NotificationService } from '../../_services/notification.service'
import { Router, ActivatedRoute } from '@angular/router';
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

  constructor(private authenticationService: AuthenticationService, private router: Router,
    private notifyService: NotificationService,
    private toast: ToastrService,
    private fb: FormBuilder) {
    this.registerNewUser = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: [''],
      otp: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required, Validators.minLength(8)]],
      companyName: ['']
    }, { validator: this.passwordMatchValidator })
  }

  ngOnInit(): void {
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('passwordConfirm')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  onGenerateOTP() {
    let email = this.registerNewUser.get('email').value;
    this.loading = true;
    this.authenticationService.generateOTP({ email }).subscribe(
      () => {
        this.toast.success('OTP sent to your email', 'Success');
        this.loading = false;
        this.otpGenerated = true;

      },
      (error) => {
        this.notifyService.showError(error.message, 'Error');
      }
    );
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
        this.notifyService.showError(error.message, 'Error');
      }
    );
  }

  onCancelOTP() {
    const payload = {
      email: this.registerNewUser.get('email').value,
      otp: this.registerNewUser.get('otp').value,
    };
    this.authenticationService.cancelOTP(payload).subscribe(
      () => {
        this.notifyService.showSuccess('OTP cancelled', 'Success');
        this.otpGenerated = false;
        this.otpVerified = false;
        this.registerNewUser.get('otp').reset();
      },
      (error) => {
        this.notifyService.showError(error.message, 'Error');
      }
    );
  }

  onSubmit() {
    this.loading = true;
    if (this.registerNewUser.value.password !== this.registerNewUser.value.passwordConfirm) {
      this.notifyService.showWarning("Passwords don't match", "Warning");
      return;
    }
    this.authenticationService.webSignup(this.registerNewUser.value).subscribe(
      data => {
        setTimeout(() => {
          this.notifyService.showSuccess("User Created Successfully", "Success")
          this.router.navigate(['/login']);
          this.loading = false;
        }, 300);
      },
      err => {
        this.notifyService.showError(err.message, "Error")
        if (err.message) {
          this.loading = false;
        }
      }
    );
  }
  getCurrentYear(): number {
    return new Date().getFullYear();
  }
  
}
