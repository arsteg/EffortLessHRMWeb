import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { AlertService } from '../../_services/alert.service';
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  constructor( private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, 
         Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")] ]
      });
  }
  get f() { return this.forgotPasswordForm.controls; }
  onSubmit(){
    this.submitted = true;

     // reset alerts on submit
     this.alertService.clear();
     // stop here if form is invalid


    this.loading = true;
    this.authenticationService.forgotPassword(this.forgotPasswordForm.value.email)
    .pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.alertService.success("Your Resent password Link send Successfully , Please check your mail");        
      },
     
    error => {
        this.alertService.error(error);
        this.loading = false;
    });
}
  
}
