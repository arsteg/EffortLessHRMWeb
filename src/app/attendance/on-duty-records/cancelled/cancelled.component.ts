import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-onDutyCancelled',
  templateUrl: './cancelled.component.html',
  styleUrl: './cancelled.component.css'
})
export class CancelledComponent {
  actionOptions = {
    approve: false,
    reject: false,
    cancel: false,
    view: true
  };
  @Input() selectedTab: number;
}
