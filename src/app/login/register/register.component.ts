import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import {signup} from  '../../models/user'
import { NotificationService } from '../../_services/notification.service'


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
loading=false;
user:signup= new signup();
@ViewChild('f') registerForm: NgForm;
  constructor( private authenticationService: AuthenticationService,
    private notifyService : NotificationService) { }

  ngOnInit(): void {
  }

  onSubmit(){
    this.loading = true;
    this.user.name=this.registerForm.value.name;
    this.user.email=this.registerForm.value.email;
    this.user.password=this.registerForm.value.password;
    this.user.passwordConfirm=this.registerForm.value.password;
    this.user.role='user';

    this.authenticationService.signup(this.user).subscribe(
      data => {
         setTimeout(() => {
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
