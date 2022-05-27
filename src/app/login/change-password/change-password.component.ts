import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { changeUserPassword, signup } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { NotificationService } from 'src/app/_services/notification.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  loading=false;  
  resetToken: null;
  CurrentState: any; 
  submitted=false;
  user:changeUserPassword= new changeUserPassword();
  @ViewChild('f') changePasswordForm: NgForm;

  constructor( private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notifyService: NotificationService) {     
      this.route.params.subscribe(params => {
      this.resetToken = params['token'];           
    }); }

  ngOnInit(): void {
  }
  
  onSubmit() {
    this.submitted = true;
    this.user.passwordCurrent=this.changePasswordForm.value.passwordCurrent;
    this.user.password=this.changePasswordForm.value.password;
    this.user.passwordConfirm=this.changePasswordForm.value.confirm_password;  
    this.user.id=this.authenticationService.currentUserValue["data"].user.id;   
    if(this.changePasswordForm.value.password!==this.changePasswordForm.value.confirm_password)
    {
      this.notifyService.showWarning("Passwords don't match","warning");
      return;
    }
    this.loading = true;  
    this.authenticationService.changePassword(this.user)
      .pipe(first())
      .subscribe(        
        data => {
             setTimeout(() => {
             this.loading = false;
             this.router.navigate(['/']);
             this.notifyService.showSuccess("Password change Successfully", "success")          
          }, 30);
        },
        err => {
          if (err.error) {  
            this.loading = false;     
            this.notifyService.showError(err.message, "Error")
          }         
        }        
      );
  }
}
