import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-employee-settings',
  templateUrl: './employee-settings.component.html',
  styleUrl: './employee-settings.component.css'
})
export class EmployeeSettingsComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: string = 'tabEmploymentDetails';
  @Input() selectedUser: any;
  
  ngOnInit() {
    console.log('test', this.selectedUser);
  }
  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

}
