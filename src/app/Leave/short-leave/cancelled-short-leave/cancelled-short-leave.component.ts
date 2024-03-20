import { Component } from '@angular/core';

@Component({
  selector: 'app-cancelled-short-leave',
  templateUrl: './cancelled-short-leave.component.html',
  styleUrl: './cancelled-short-leave.component.css'
})
export class CancelledShortLeaveComponent {
  actionOptions = {
    approve: false,
    reject: false,
    delete: false,
    view: true
  };
}
