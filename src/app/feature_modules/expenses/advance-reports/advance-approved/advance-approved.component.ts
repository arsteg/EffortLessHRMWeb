import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-advance-approved',
  templateUrl: './advance-approved.component.html',
  styleUrl: './advance-approved.component.css'
})
export class AdvanceApprovedComponent {
  actionOptions = {
    approve: false,
    reject: false,
    view: true,
    cancel: true,
    delete: false,
    edit: false
  };
  @Input() selectedTab: number;

  ngOnInit() {
    console.log(status);
  }
}
