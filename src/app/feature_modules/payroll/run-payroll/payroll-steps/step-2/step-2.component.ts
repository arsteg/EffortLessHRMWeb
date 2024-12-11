import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { AttendanceService } from 'src/app/_services/attendance.service';
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
  selectedUserId: any;
  selectedRecord: any;
  users: any;
  payrollUser: any;
  attendanceLOPUser: any;


  constructor(private payrollService: PayrollService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private commonService: CommonService,
    private toast: ToastrService,
    private attendanceService: AttendanceService
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
    this.getAttendanceSummaryByPayroll();
  }

  onUserSelectedFromChild(userId: string) {
    this.selectedUserId = userId;
    this.getAttendanceSummary();
    this.getProcessAttendanceLOPForPayrollUser();
  }

  open(content: any) {
    if (this.changeMode == 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord.payrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;
        const payrollUser = this.payrollUser?.user;
        this.attendanceSummaryForm.patchValue({
          totalDays: this.selectedRecord?.totalDays,
          lopDays: this.selectedRecord?.lopDays,
          payableDays: this.selectedRecord?.payableDays
        });
        this.attendanceSummaryForm.get('payrollUser').disable();
      });
    }
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
    this.payrollService.getAttendanceSummary(this.selectedUserId._id).subscribe(
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
    // Extract form values
    const formData = this.attendanceSummaryForm.value;

    // Perform a check for existing records
    const existingRecord = this.attendanceSummary.find(
      (record: any) =>
        record.payrollUser === this.selectedUserId._id &&
        record.month === formData.month &&
        record.year === formData.year
    );

    if (existingRecord) {
      // Show toast if record exists
      this.toast.warning(
        'Attendance summary for the selected payroll user, month, and year already exists.',
        'Duplicate Record!'
      );
      return; // Stop further execution
    }

    // Continue if no duplicate record exists
    if (this.changeMode === 'Add') {
      formData.payrollUser = this.selectedUserId._id;

      this.payrollService.addAttendanceSummary(formData).subscribe(
        (res: any) => {
          this.getAttendanceSummary(); // Refresh attendance summary
          this.attendanceSummaryForm.enable(); // Re-enable form

          // Reset form fields
          this.attendanceSummaryForm.patchValue({
            payrollUser: '',
            totalDays: 0,
            lopDays: 0,
            payableDays: 0,
          });

          // Show success message
          this.toast.success(
            'Attendance summary for payroll user created successfully!',
            'Success!'
          );
        },
        (err) => {
          // Show error message
          this.toast.error(
            'Attendance summary for payroll user could not be created.',
            'Error!'
          );
        }
      );
    }
  }

  getMonthNumber(monthName: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName) + 1;
  }

  getTotalDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  getProcessAttendanceLOPForPayrollUser() {
    let payload = {
      skip: '',
      next: '',
      month: this.getMonthNumber(this.selectedPayroll.month),
      year: this.selectedPayroll.year
    }

    this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe((res: any) => {
      this.attendanceLOPUser = res.data;
      const matchingUsers = this.attendanceLOPUser.filter((lop: any) => lop.user === this.selectedUserId?.user);

      // Get the length of the matching users
      const lopUserLength = matchingUsers.length;
      const payableDays = this.getTotalDaysInMonth(payload.year, payload.month) - lopUserLength;

      this.attendanceSummaryForm.patchValue({
        lopDays: lopUserLength,
        payableDays: payableDays,
        totalDays: this.getTotalDaysInMonth(payload.year, payload.month)
      });
      this.attendanceSummaryForm.disable();
    })
  }

  getAttendanceSummaryByPayroll() {
    this.payrollService.getAttendanceSummaryBypayroll(this.selectedPayroll?._id).subscribe((res: any) => {
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
        },
        (error) => {
          console.error("Error fetching payroll user details:", error);
        }
      );
    },
      (error) => {
        console.error("Error fetching attendance summary:", error);
      }
    )
  }
}
