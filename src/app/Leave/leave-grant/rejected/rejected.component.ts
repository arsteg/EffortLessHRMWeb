import { Component } from '@angular/core';

@Component({
  selector: 'app-rejected',
  templateUrl: './rejected.component.html',
  styleUrl: './rejected.component.css'
})
export class RejectedComponent {
  actionOptions = {
    approve: false,
    reject: false,
    delete: false,
    view: true
  };
}