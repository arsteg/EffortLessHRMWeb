import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrl: './approved.component.css'
})
export class ApprovedComponent {
  actionOptions = {
    approve: false,
    reject: false,
    cancel: true,
    view: true
  };
  @Input() selectedTab: number;
}
