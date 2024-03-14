import { Component } from '@angular/core';

@Component({
  selector: 'app-approved-application',
  templateUrl: './approved-application.component.html',
  styleUrl: './approved-application.component.css'
})
export class ApprovedApplicationComponent {
  actionOptions = {
    approve: false,
    reject: false,
    delete: false,
    view: true
  };
}
