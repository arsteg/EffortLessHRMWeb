import { Component, OnInit,Input} from '@angular/core';
import { Router,ActivatedRoute  } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import {slideToTop} from '../router.animations'
import { first } from 'rxjs/operators';
import { AlertService } from '../_services/alert.service';
import { AuthenticationService } from '../_services/authentication.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  username: string;
  password: string;

  constructor( private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService) {if (this.authenticationService.currentUserValue) {
      //this.router.navigate(['/']);
  }
}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
  });

  // get return url from route parameters or default to '/'
  this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  get f() { return this.loginForm.controls; }

  onSubmit() {
  {
    this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid


    this.loading = true;

   // username:String=this.f.username.value;
   this.authenticationService.login(this.loginForm.value.username, this.loginForm.value.password)
            .pipe(first())
        .subscribe(
            data => {
              this.loading = false;
                this.router.navigate([this.returnUrl]);
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
     }
  }

}
