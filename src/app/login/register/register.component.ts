import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { NotificationService } from '../../_services/notification.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login.component.css', './register.component.css']
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
    private translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.registerNewUser = this.fb.group({
      firstName: ['', [Validators.required, CustomValidators.noSpacesNumbersOrSymbolsValidator,Validators.maxLength(15),Validators.minLength(3)]],
      lastName: ['', [Validators.required, CustomValidators.noSpacesNumbersOrSymbolsValidator,Validators.maxLength(15),Validators.minLength(3)]],
      email: ['', [Validators.required, CustomValidators.email]],
      otp: ['', [Validators.required,  Validators.pattern(/^\d{4}$/)]],
      password: ['', [Validators.required, CustomValidators.strongPasswordValidator]],
      passwordConfirm: ['', [Validators.required]],
      companyName: ['']
    }, {  
      validators: CustomValidators.passwordMatchValidator });
  }

  ngOnInit(): void {} 

  onGenerateOTP() {
    let emailControl = this.registerNewUser.get('email');
    if (emailControl.valid) {
      let email = emailControl.value;
      this.authenticationService.generateOTP({ email }).subscribe(
        () => {
          this.loading = true;
          this.notifyService.showSuccess( this.translate.instant('login.otp_sent'), 'Success');
          this.loading = false;
          this.otpGenerated = true;
        },
        (err) => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('login.entered_wrong_otp')
          ;
          this.notifyService.showError( errorMessage,  "Error");         
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
        this.notifyService.showSuccess( this.translate.instant('login.otp_verified'), 'Success');
        this.otpVerified = true;
      },
      (err) => {
        console.log("Heello");
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('login.entered_wrong_otp')
        ;
        this.notifyService.showError( errorMessage,  "Error");
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
    this.registerNewUser.markAllAsTouched();
  
    if (this.registerNewUser.invalid) {      
      return;
    }
    if (!this.otpVerified) {
      this.notifyService.showWarning( this.translate.instant('login.otp_not_verified'),'Warning');
      return;
    }
    if (this.registerNewUser.value.password !== this.registerNewUser.value.passwordConfirm) {
      this.notifyService.showWarning( this.translate.instant('login.password_mismatch'), 'Warning');
      return;
    }
    if (this.registerNewUser.valid) {
      this.loading = true;
      this.authenticationService.webSignup(this.registerNewUser.value).subscribe(
        data => {
          setTimeout(() => {
            this.notifyService.showSuccess( this.translate.instant('login.user_created'), 'Success');
            this.router.navigate(['/login']);
            this.loading = false;
          }, 300);
        },
        err => {      
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('login.signup_Failed')
          ;
          this.toast.error(errorMessage, 'Error!');     
          this.loading = false;        
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
