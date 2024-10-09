import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-advance-cancelled',
  templateUrl: './advance-cancelled.component.html',
  styleUrl: './advance-cancelled.component.css'
})
export class AdvanceCancelledComponent {
  actionOptions = {
    approve: false,
    reject: false,
    view: true,
    cancel: false
  };
  @Input() selectedTab: number;

}
