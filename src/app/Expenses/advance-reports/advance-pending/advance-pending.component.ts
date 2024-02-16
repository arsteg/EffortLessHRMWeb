import { Component } from '@angular/core';

@Component({
  selector: 'app-advance-pending',
  templateUrl: './advance-pending.component.html',
  styleUrl: './advance-pending.component.css'
})
export class AdvancePendingComponent {
  actionOptions = {
    approve: true,
    reject: true,
    view: true,
    cancel: false
  };
}
