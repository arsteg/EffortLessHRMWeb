import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { first, Observable } from 'rxjs';
import { signup } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { Base } from '../../controls/base';
import { UserService } from '../users.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  providers:  [UserService]
})

export class UserProfileComponent implements OnInit {
  controls$: Observable<Base<any>[]>;
  public user: signup=new signup();
  constructor(private UserService: UserService,private authenticationService:AuthenticationService) {
  this.controls$=UserService.getQuestions(this.user);
  }
  
  ngOnInit(): void {
  }
}
