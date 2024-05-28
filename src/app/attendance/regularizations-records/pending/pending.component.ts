import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingComponent {
  actionOptions = {
    approve: true,
    reject: true,
    cancel: false,
    view: true
  };
  @Input() selectedTab: number;
} 
