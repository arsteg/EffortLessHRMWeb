import { Component } from '@angular/core';

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrl: './approved.component.css'
})
export class ApprovedComponent {
  actionOptions = {
    approve: false,
    reject: false,
    delete: false,
    view: true
  };
}
