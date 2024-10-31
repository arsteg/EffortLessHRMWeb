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
  users: any;
  selectedUserId: string | undefined;

  @Input() selectedPayroll: any;
  @Output() userSelected = new EventEmitter<string>();

  constructor(private payrollService: PayrollService,
    private commonService: CommonService
  ) {

  }

  ngOnInit() {
    this.getAllUsers();
    let payload = { skip: '', next: '', payroll: this.selectedPayroll?._id }
    this.payrollService.getPayrollUsers(payload).subscribe((res: any) => {
      this.payrollUsers = res.data;
    })
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }


  onUserSelect(event: Event) {
    const userId = (event.target as HTMLSelectElement).value;
    this.selectedUserId = userId;
    this.userSelected.emit(userId);
  }
}
