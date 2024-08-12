import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-employee-settings',
  templateUrl: './employee-settings.component.html',
  styleUrl: './employee-settings.component.css'
})
export class EmployeeSettingsComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: string = 'tabEmploymentProfile';
  @Input() selectedUser: any;

  ngOnInit() { }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

}
