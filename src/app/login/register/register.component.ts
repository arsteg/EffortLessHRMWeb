import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { signup, webSignup } from '../../models/user'
import { NotificationService } from '../../_services/notification.service'
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  loading = false;
  registerNewUser: FormGroup;

  constructor(private authenticationService: AuthenticationService, private router: Router,
    private notifyService: NotificationService,
    private fb: FormBuilder) {
    this.registerNewUser = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: [''],
      password: [''],
      passwordConfirm: [''],
      companyName: ['']
    })
  }

  ngOnInit(): void {
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
}
