import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-supervisors',
  templateUrl: './supervisors.component.html',
  styleUrl: './supervisors.component.css'
})
export class SupervisorsComponent {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  supervisors: any;

  constructor(private auth: AuthenticationService) { }
  ngOnInit() {
    this.getUserManagers();
  }

  getUserManagers() {
    this.auth.getUserManagers(this.currentUser.id).subscribe((res: any) => {
      this.supervisors = res.data;
    })
  }
}
