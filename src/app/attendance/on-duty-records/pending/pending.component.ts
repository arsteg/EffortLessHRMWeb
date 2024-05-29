import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-onDutyPending',
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingOnDutyComponent {
  actionOptions = {
    approve: true,
    reject: true,
    cancel: false,
    view: true
  };
  @Input() selectedTab: number;
}
