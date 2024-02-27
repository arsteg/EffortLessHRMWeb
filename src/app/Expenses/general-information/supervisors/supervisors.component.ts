import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-supervisors',
  templateUrl: './supervisors.component.html',
  styleUrl: './supervisors.component.css'
})
export class SupervisorsComponent {
  supervisors: any;
  allAssignee: any;

  constructor(private auth: AuthenticationService,
    private expenseService: ExpensesService,
    private commonService: CommonService) {

  }
  ngOnInit() {
    this.auth.currentUser.subscribe(res => {
      const user = res.id;
      this.expenseService.getEmployeeExpenseAssignments(user).subscribe((result: any) => {
        this.supervisors = result.data;
      });
    });

    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Not Found';
  }

}
