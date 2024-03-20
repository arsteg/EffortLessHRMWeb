import { Component } from '@angular/core';

@Component({
  selector: 'app-pending-short-leave',
  templateUrl: './pending-short-leave.component.html',
  styleUrl: './pending-short-leave.component.css'
})
export class PendingShortLeaveComponent {
  actionOptions = {
    approve: true,
    reject: true,
    delete: true,
    view: true
  };
}
