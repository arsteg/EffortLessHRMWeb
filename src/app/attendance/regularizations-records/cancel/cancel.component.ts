import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrl: './cancel.component.css'
})
export class CancelComponent {
  actionOptions = {
    approve: false,
    reject: false,
    cancel: false,
    view: true
  };
  @Input() selectedTab: number;
}
