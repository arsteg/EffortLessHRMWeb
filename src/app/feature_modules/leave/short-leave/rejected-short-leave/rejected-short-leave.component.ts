import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rejected-short-leave',
  templateUrl: './rejected-short-leave.component.html',
  styleUrl: './rejected-short-leave.component.css'
})
export class RejectedShortLeaveComponent {
  actionOptions = {
    approve: false,
    reject: false,
    delete: false,
    view: true
  };
  @Input() selectedTab: number;

}
