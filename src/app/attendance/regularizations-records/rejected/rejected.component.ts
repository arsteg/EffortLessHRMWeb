import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rejected-list',
  templateUrl: './rejected.component.html',
  styleUrl: './rejected.component.css'
})
export class RejectedComponent {
  actionOptions = {
    approve: true,
    reject: false,
    cancel: false,
    view: true
  };
  @Input() selectedTab: number;
}
