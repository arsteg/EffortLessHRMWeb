import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-employee-settings',
  templateUrl: './employee-settings.component.html',
  styleUrl: './employee-settings.component.css'
})
export class EmployeeSettingsComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: string = 'tabEmploymentProfile';
  @Input() selectedUser: any;
  data: any;
  isEdit: boolean;

  constructor(private userService: UserService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.selectTab('tabEmploymentProfile');
    this.data = this.userService.getData();
    this.isEdit = this.userService.getIsEdit();
    console.log(this.data);
    console.log(this.isEdit);
  }

  
  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

}
