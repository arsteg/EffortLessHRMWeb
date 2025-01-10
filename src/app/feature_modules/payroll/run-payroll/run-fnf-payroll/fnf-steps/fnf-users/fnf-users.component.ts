import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-fnf-users',
  templateUrl: './fnf-users.component.html',
  styleUrls: ['./fnf-users.component.css']
})
export class FnfUsersComponent implements OnInit {
  fnfUsers: any[] = [];
  selectedFnFUser: string;
  users: any[] = [];
  @Output() changeUser: EventEmitter<string> = new EventEmitter<string>();
  // @Output() userSelected = new EventEmitter<string>();

  constructor(private payrollService: PayrollService,
    private commonService: CommonService) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data['data'];
    });
    this.fetchFnFUsers();
  }

  fetchFnFUsers(): void {
    const fnfPayroll = this.payrollService.selectedFnFPayroll.getValue();
    if (fnfPayroll && fnfPayroll.userList) {
      this.fnfUsers = fnfPayroll.userList;
    } else {
      this.payrollService.selectedFnFPayroll.subscribe((res) => {
        this.fnfUsers = res.userList;
      });
    }
  }

  onFnFUserSelection(event: any): void {
    this.selectedFnFUser = event.value;
    this.changeUser.emit(this.selectedFnFUser);
    console.log('Selected FnF User ID:', this.selectedFnFUser);
  }

  getUserNames(userId: string): string {
    const user = this.users.find((user) => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : '';
  }
}
