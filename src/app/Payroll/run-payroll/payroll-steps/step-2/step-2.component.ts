import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, map } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-step-2',
  templateUrl: './step-2.component.html',
  styleUrl: './step-2.component.css'
})
export class Step2Component {
  searchText: string = '';
  closeResult: string = '';
  attendanceSummaryForm: FormGroup;
  @Input() selectedPayroll: any;
  attendanceSummary: any;
  changeMode: 'Add' | 'Update' = 'Add';
  selectedUserId: string | undefined;
  users: any;

  constructor(private payrollService: PayrollService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private commonService: CommonService
  ) {
    this.attendanceSummaryForm = this.fb.group({
      payrollUser: [''],
      totalDays: [0],
      lopDays: [0],
      payableDays: [0]
    })
  }

  ngOnInit() {
    this.getAllUsers();
    this.getAttendanceSummary();
  }

  onUserSelectedFromChild(userId: string) {
    this.selectedUserId = userId;
    this.getAttendanceSummary();
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
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
  
  getAttendanceSummary() {
    this.payrollService.getAttendanceSummary(this.selectedUserId).subscribe(
      (res: any) => {
        this.attendanceSummary = res.data;
        const userRequests = this.attendanceSummary.map((item: any) => {
          return this.payrollService.getPayrollUserById(item.payrollUser).pipe(
            map((userRes: any) => ({
              ...item,
              payrollUserDetails: this.getUser(userRes?.data.user)
            }))
          );
        });
  
        forkJoin(userRequests).subscribe(
          (results: any[]) => {
            this.attendanceSummary = results;
            console.log(this.attendanceSummary)
          },
          (error) => {
            console.error("Error fetching payroll user details:", error);
          }
        );
      },
      (error) => {
        console.error("Error fetching attendance summary:", error);
      }
    );
  }

  onSubmission() {
    this.attendanceSummaryForm.value.payrollUser = this.selectedUserId;
    this.payrollService.addAttendanceSummary(this.attendanceSummaryForm.value).subscribe((res: any) => {
      this.attendanceSummary.push(res.data);
      this.attendanceSummaryForm.patchValue({
        payrollUser: '',
        totalDays: 0,
        lopDays: 0,
        payableDays: 0
      })
    })
  }
}
