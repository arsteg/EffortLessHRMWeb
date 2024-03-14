import { Component } from '@angular/core';

@Component({
  selector: 'app-cancelled-application',
  templateUrl: './cancelled-application.component.html',
  styleUrl: './cancelled-application.component.css'
})
export class CancelledApplicationComponent {
  actionOptions = {
    approve: false,
    reject: false,
    delete: false,
    view: true
  };
}
