import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { PayrollService } from 'src/app/_services/payroll.service';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-fnf-users',
  templateUrl: './fnf-users.component.html',
  styleUrls: ['./fnf-users.component.css']
})
export class FnfUsersComponent implements OnInit {
  fnfUsers: any;
  selectedFnFUser: string;
  users: any[] = [];
  @Output() changeUser: EventEmitter<string> = new EventEmitter<string>();
  @Input() isStep: boolean = false;
  @Input() selectedFnF: any;
  settledUsers: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit() {
    forkJoin({
      settledUsers: this.userService.getUsersByStatus('Settled'),
      fnfUsers: this.fetchFnFUsers()
    }).subscribe(({ settledUsers, fnfUsers }) => {
      this.settledUsers = settledUsers.data['users'];
      this.fnfUsers = fnfUsers;
      this.filterAvailableUsers();
    });
  }

  fetchFnFUsers(): any {
    return new Observable(observer => {
      if (this.selectedFnF && this.selectedFnF.userList) {
        observer.next(this.selectedFnF.userList);
        observer.complete();
      } else {
        observer.next([]);
        observer.complete();
      }
    });
  }

  filterAvailableUsers(): void {
    if (this.fnfUsers && this.settledUsers.length > 0 && !this.isStep) {
        this.users = this.settledUsers.filter(user =>
          !this.selectedFnF?.userList.some(fnfUser => fnfUser.user === user._id) // Not in fnfUsers
            && !user.fnfPayroll
        );
    } else if (this.fnfUsers && this.settledUsers.length > 0 && this.isStep) {
        this.users = this.settledUsers.filter(user => {
            return this.fnfUsers.some(fnfUser => fnfUser.user === user._id);
        });
    }
}

  onFnFUserSelection(event: any): void {
    this.selectedFnFUser = event.value;
    this.changeUser.emit(this.selectedFnFUser);
  }
}