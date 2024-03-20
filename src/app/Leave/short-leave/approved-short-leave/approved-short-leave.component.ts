import { Component } from '@angular/core';

@Component({
  selector: 'app-approved-short-leave',
  templateUrl: './approved-short-leave.component.html',
  styleUrl: './approved-short-leave.component.css'
})
export class ApprovedShortLeaveComponent {
  actionOptions = {
    approve: false,
    reject: false,
    delete: false,
    view: true
  };
}
