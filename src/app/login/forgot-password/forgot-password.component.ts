import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
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
  user:signup= new signup();
  @ViewChild('f') forgotPasswordForm: NgForm;
  constructor( private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notifyService: NotificationService) { }

  ngOnInit(): void {
   
  }
  get f() { return this.forgotPasswordForm.controls; }
  onSubmit(){
    this.submitted = true;
    this.user.email=this.forgotPasswordForm.value.email;
  alert(this.user.email);
    this.loading = true;
    this.authenticationService.forgotPassword(this.user.email)
    .pipe(first()).subscribe(
      data => {
        this.loading = false;
        this.notifyService.showSuccess("Your Resent password Link send Successfully , Please check your mail","success");        
      },
     
    error => {
        this.notifyService.showError("There is no user with email address.","error");
        this.loading = false;
    });
}
  
}
