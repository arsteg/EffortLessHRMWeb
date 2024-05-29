import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-onDutyApproved',
  templateUrl: './approved.component.html',
  styleUrl: './approved.component.css'
})
export class ApprovedOnDutyComponent {
  actionOptions = {
    approve: false,
    reject: false,
    cancel: false,
    view: true
  };
  @Input() selectedTab: number;
}
