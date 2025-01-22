import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from 'src/app/_services/users.service';

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
  @Input() isStep: boolean = false;

  constructor(private payrollService: PayrollService,
    private userService: UserService) { }

  ngOnInit() {
    this.fetchFnFUsers();
    this.getSettledUsers();
  }

  fetchFnFUsers(): void {
    const fnfPayroll = this.payrollService.selectedFnFPayroll.getValue();
    if (fnfPayroll && fnfPayroll.userList) {
      this.fnfUsers = fnfPayroll.userList;
      this.filterAvailableUsers();
    } else {
      this.payrollService.selectedFnFPayroll.subscribe((res) => {
        this.fnfUsers = res.userList;
        this.filterAvailableUsers();
      });
    }
  }

  getSettledUsers(): void {
    this.userService.getUsersByStatus('Settled').subscribe((res: any) => {
      this.users = res.data['users'];
      this.filterAvailableUsers();
    });
  }

  filterAvailableUsers(): void {
    if (this.fnfUsers && this.users && !this.isStep) {
      this.users = this.users.filter(user =>
        !this.fnfUsers.some(fnfUser => fnfUser.user === user._id)
      );
    }
    if (this.isStep) {
      this.users = this.users.filter(user =>
        this.fnfUsers.some(fnfUser => fnfUser.user === user._id)
      );
    }
  }

  onFnFUserSelection(event: any): void {
    this.selectedFnFUser = event.value;
    this.changeUser.emit(this.selectedFnFUser);
  }
}
