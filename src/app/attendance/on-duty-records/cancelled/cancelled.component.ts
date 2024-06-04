import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-onDutyCancelled',
  templateUrl: './cancelled.component.html',
  styleUrl: './cancelled.component.css'
})
export class CancelledOnDutyComponent {
  actionOptions = {
    approve: true,
    reject: true,
    cancel: false,
    view: true
  };
  @Input() selectedTab: number;
}
