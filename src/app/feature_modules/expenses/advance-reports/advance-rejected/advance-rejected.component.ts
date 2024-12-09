import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-advance-rejected',
  templateUrl: './advance-rejected.component.html',
  styleUrl: './advance-rejected.component.css'
})
export class AdvanceRejectedComponent {
  actionOptions = {
    approve: false,
    reject: false,
    view: true,
    cancel: false
  }
  @Input() selectedTab: number;

}
