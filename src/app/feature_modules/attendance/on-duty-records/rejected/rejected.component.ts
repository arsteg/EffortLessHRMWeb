import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-onDutyRejected',
  templateUrl: './rejected.component.html',
  styleUrl: './rejected.component.css'
})
export class RejectedOnDutyComponent {
  actionOptions = {
    approve: false,
    reject: false,
    cancel: false,
    view: true
  };
  @Input() selectedTab: number;
}
