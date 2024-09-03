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
  @Input() isEdit: boolean = false;

  ngOnInit() {
    this.selectTab('tabEmploymentProfile');
   }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

}
