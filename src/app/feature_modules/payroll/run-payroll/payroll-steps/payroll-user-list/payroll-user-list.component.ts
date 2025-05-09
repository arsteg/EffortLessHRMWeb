import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-payroll-user-list',
  templateUrl: './payroll-user-list.component.html',
  styleUrl: './payroll-user-list.component.css'
})
export class PayrollUserListComponent {
  payrollUsers: any;
  allUsers: any;
  selectedUser: string = '';

  @Input() selectedPayroll: any;
  @Output() userSelected = new EventEmitter<string>();

  constructor(private payrollService: PayrollService
  ) { }

  ngOnInit() {
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    })
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  onUserSelect(selectedUser: any) {
    this.userSelected.emit(selectedUser);
  }

}