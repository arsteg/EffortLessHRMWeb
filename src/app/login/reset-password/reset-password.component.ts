import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  loading=false;
  resetPasswordForm: FormGroup; 
  resetToken: null;
  CurrentState: any; 
  submitted=false;
  constructor( private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService) {
      this.route.params.subscribe(params => {
      this.resetToken = params['token'];         
    }); }
   
  ngOnInit(): void {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['',Validators.required],
      confirm_password: ['', Validators.required]
  });
  
  }
  get f() { return this.resetPasswordForm.controls; }
 
  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();
    // stop here if form is invalid

      this.loading = true;  
      this.authenticationService.resetPassword(this.resetPasswordForm.value.password,this.resetPasswordForm.value.confirm_password,this.resetToken).subscribe(
        data => {
           this.resetPasswordForm.reset();
           setTimeout(() => {
            this.loading = false;
            this.router.navigate(['login']);
          }, 300);
        },
        err => {
          if (err.error.message) {
            this.alertService.error(err);
            this.loading = false;
          }
        }
      );   
  }

}
