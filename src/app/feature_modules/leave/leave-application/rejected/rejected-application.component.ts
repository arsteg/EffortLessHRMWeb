import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rejected-application',
  templateUrl: './rejected-application.component.html',
  styleUrl: './rejected-application.component.css'
})
export class RejectedApplicationComponent {
  actionOptions = {
    approve: false,
    reject: false,
    delete: false,
    view: true
  };
  @Input() selectedTab: number;
}
