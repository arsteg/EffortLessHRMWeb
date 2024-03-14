import { Component } from '@angular/core';

@Component({
  selector: 'app-pending-application',
  templateUrl: './pending-application.component.html',
  styleUrl: './pending-application.component.css'
})
export class PendingApplicationComponent {
  actionOptions = {
    approve: true,
    reject: true,
    delete: false,
    view: true
  };
}