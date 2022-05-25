import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import {signup} from  '../../models/user'
import { NotificationService } from '../../_services/notification.service'
import { Router,ActivatedRoute  } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
loading=false;
user:signup= new signup();
@ViewChild('f') registerForm: NgForm;
  constructor( private authenticationService: AuthenticationService,private router: Router,
    private notifyService : NotificationService) { }

  ngOnInit(): void {
  }

  onSubmit(){
    this.loading = true;
    this.user.firstName=this.registerForm.value.firstName;
    this.user.lastName=this.registerForm.value.lastName;
    this.user.email=this.registerForm.value.email;
    this.user.password=this.registerForm.value.password;
    this.user.passwordConfirm=this.registerForm.value.passwordConfirm;
    this.user.companyName=this.registerForm.value.companyName;  
    this.user.role="627e16f8722cd08ad4875526"; 
    if(this.user.password!==this.user.passwordConfirm)
    {
      this.notifyService.showWarning("Passwords don't match","warning");
      return;
    }
    this.authenticationService.signup(this.user).subscribe(
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
}
