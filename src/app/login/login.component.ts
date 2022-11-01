import { Component, OnInit,Input, ViewChild} from '@angular/core';
import { Router,ActivatedRoute  } from '@angular/router';
import { UntypedFormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../_services/authentication.service';
import { NotificationService } from '../_services/notification.service';
import { signup, User } from '../models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  rememberMe:boolean=false;
  loading = false;
  submitted = false;
  returnUrl: string;
  user:signup= new signup();
  @ViewChild('f') loginForm: NgForm;

  constructor( private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notifyService : NotificationService) {if (this.authenticationService.currentUserValue) {
  }
}
  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.rememberMe = localStorage.getItem('rememberMe')=='true';
  }

  onSubmit() {
  {
    this.submitted = true;
    this.loading = true;
    this.user.email=this.loginForm.value.username;
    this.user.password=this.loginForm.value.password;
    this.authenticationService.login(this.user)
      .pipe(first())
        .subscribe(
            data => {
              this.loading = false;
              this.user.id = data.data.user.id;
              localStorage.setItem('jwtToken', data.token);
              localStorage.setItem('currentUser', JSON.stringify(this.user));
              localStorage.setItem('rememberMe', JSON.stringify(this.rememberMe));
              this.router.navigate([this.returnUrl]);
            },
            err => {
              this.notifyService.showError(err.message, "Error")
                this.loading = false;
            });
     }
  }
}