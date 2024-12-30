import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
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

  constructor(private payrollService: PayrollService,
    private toast: ToastrService,
    private commonService: CommonService) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data['data'];
    });
    this.fetchFnFUsers();
  }

  fetchFnFUsers(): void {
    this.payrollService.selectedFnFPayroll.subscribe((res) => {
      this.fnfUsers = res.userList;
    });
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
