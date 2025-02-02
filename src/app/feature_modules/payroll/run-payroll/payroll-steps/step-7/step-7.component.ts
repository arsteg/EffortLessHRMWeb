import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-7',
  templateUrl: './step-7.component.html',
  styleUrl: './step-7.component.css'
})
export class Step7Component {
  searchText: string = '';
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  overtime: any;
  overtimeForm: FormGroup;
  users: any;
  selectedUserId: any;
  selectedRecord: any;
  payrollUser: any;
  @Input() selectedPayroll: any;
  overtimeInformation: any;
  overtimeRecords: any;
  selectedPayrollUser: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private attendanceService: AttendanceService,
    private userService: UserService
  ) {
    this.overtimeForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      LateComing: ['', Validators.required],
      EarlyGoing: ['', Validators.required],
      FinalOvertime: ['', Validators.required],
      OvertimeAmount: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getAllUsers();
    this.getOvertimeByPayroll();
  }

  onUserSelectedFromChild(userId: any) {
    this.selectedUserId = userId.value.user;
    this.selectedPayrollUser = userId.value._id;
    this.getOvertimeByUser();
    this.getOvertime();
  }

  getOvertimeByUser() {
    const monthIndex = new Date(`${this.selectedPayroll?.month} 1, ${this.selectedPayroll?.year}`).getMonth() + 1;
    const totalDaysInMonth = new Date(parseInt(this.selectedPayroll?.year, 10), monthIndex, 0).getDate(); // Get total days

    this.attendanceService.getAttendanceOvertimeByMonth({
      skip: '',
      next: '',
      month: monthIndex,
      year: parseInt(this.selectedPayroll?.year, 10)
    }).subscribe((res: any) => {
      this.overtimeRecords = res.data;

      // Filter records for the selected month, year, and user
      const filteredRecords = this.overtimeRecords.filter(record => {
        const recordDate = new Date(record.CheckInDate);
        return (
          recordDate.getMonth() + 1 === monthIndex &&
          recordDate.getFullYear() === parseInt(this.selectedPayroll?.year, 10) &&
          record.User === this.selectedUserId
        );
      });

      // Calculate total overtime hours
      const totalOvertime = filteredRecords.reduce((sum, record) => {
        const overtimeHours = parseFloat(record.OverTime) || 0;
        return sum + overtimeHours;
      }, 0);

      let lateCount = 0;
      let earlyCount = 0;

      filteredRecords.forEach(record => {
        if (record.ShiftTime && record.CheckInTime && record.CheckOutTime) {
          const [shiftStart, shiftEnd] = record.ShiftTime.split(' '); // Extract "10:00" and "18:00"

          // Directly use CheckInTime and CheckOutTime as they already contain date and time
          const checkInDateTime = new Date(record.CheckInTime);
          const checkOutDateTime = new Date(record.CheckOutTime);

          // Construct shift start and end times for comparison
          const shiftStartTime = new Date(checkInDateTime);
          shiftStartTime.setHours(parseInt(shiftStart.split(':')[0]), parseInt(shiftStart.split(':')[1]), 0);

          const shiftEndTime = new Date(checkOutDateTime);
          shiftEndTime.setHours(parseInt(shiftEnd.split(':')[0]), parseInt(shiftEnd.split(':')[1]), 0);

          if (checkInDateTime > shiftStartTime) lateCount++; // Count Late Comings
          if (checkOutDateTime < shiftEndTime) earlyCount++; // Count Early Goings
        }
      });

      // Get Gross Salary
      this.userService.getSalaryByUserId(this.selectedUserId).subscribe((res: any) => {
        const lastSalaryRecord = res.data[res.data.length - 1];
        let grossSalary = parseFloat(lastSalaryRecord?.Amount) || 0; // Ensure it's a valid number

        if (lastSalaryRecord?.enteringAmount === 'Yearly') {
          grossSalary = grossSalary / 12; // Convert yearly salary to monthly
        }

        // Get Full Day Credit Hours
        this.attendanceService.getShiftByUser(this.selectedUserId).subscribe((res: any) => {
          const fullDayCreditHours = parseFloat(res.data?.minHoursPerDayToGetCreditForFullDay) || 1; // Avoid division by zero

          // Salary Calculations
          const salaryPerDay = grossSalary / totalDaysInMonth;
          console.log('Perday:', salaryPerDay)
          const salaryPerHour = salaryPerDay / fullDayCreditHours;
          console.log('PerHour:', salaryPerHour)
          const overtimePayableSalary = salaryPerHour * (totalOvertime / 60);
          console.log(overtimePayableSalary);
          // Patch calculated values into the form
          this.overtimeForm.patchValue({
            FinalOvertime: totalOvertime,
            LateComing: lateCount,
            EarlyGoing: earlyCount,
            OvertimeAmount: overtimePayableSalary.toFixed(2), // Round to 2 decimal places
          });

          // Disable form fields
          this.overtimeForm.get('FinalOvertime').disable();
          this.overtimeForm.get('LateComing').disable();
          this.overtimeForm.get('EarlyGoing').disable();
          this.overtimeForm.get('OvertimePayableSalary').disable();
        });
      });
    });
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  openDialog() {
    if (this.changeMode == 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord?.PayrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;
        const payrollUser = this.payrollUser?.user;
        this.overtimeForm.patchValue({
          PayrollUser: this.getUser(payrollUser),
          LateComing: this.selectedRecord?.LateComing,
          EarlyGoing: this.selectedRecord?.EarlyGoing,
          FinalOvertime: this.selectedRecord?.FinalOvertime
        });
        this.overtimeForm.get('PayrollUser').disable();
      });
    }
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  getAttendanceOvertimeInformation() {
    let payload = { skip: '', next: '' };
    this.attendanceService.getOverTime(payload.skip, payload.next).subscribe((res: any) => {
      this.overtimeInformation = res.data;
      const totalOvertime = this.overtimeInformation.reduce((sum, item) => {
        return sum + (item.Overtime || 0);
      }, 0);

      console.log('Total Overtime:', totalOvertime);
    });
  }

  getOvertime() {
    this.payrollService.getOvertime(this.selectedPayrollUser).subscribe((res: any) => {
      this.overtime = res.data.records;
      const userRequests = this.overtime?.map((item: any) => {
        return this.payrollService.getPayrollUserById(this.selectedPayrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.overtime = results;
        },
        (error) => {
          this.toast.error("Error fetching payroll user details:", error);
        }
      );
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      }
    );
  }

  getOvertimeByPayroll() {
    this.payrollService.getOvertimeByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.overtime = res.data;
      const userRequests = this.overtime?.map((item: any) => {
        return this.payrollService.getPayrollUserById(item.PayrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.overtime = results;
        },
        (error) => {
          this.toast.error("Error fetching payroll user details:", error);
        }
      );
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      });
  }

  onSubmission() {
    this.overtimeForm.get('FinalOvertime').enable();
    this.overtimeForm.get('LateComing').enable();
    this.overtimeForm.get('EarlyGoing').enable();
    this.overtimeForm.patchValue({
      PayrollUser: this.selectedPayrollUser,
      LateComing: this.overtimeForm.get('LateComing').value,
      EarlyGoing: this.overtimeForm.get('EarlyGoing').value,
      FinalOvertime: this.overtimeForm.get('FinalOvertime').value
    })
    if (this.changeMode == 'Add') {
      this.payrollService.addOvertime(this.overtimeForm.value).subscribe((res: any) => {
        this.getOvertime();
        this.overtimeForm.reset();
        this.toast.success('Overtime Created', 'Successfully!');
        this.closeDialog();
      },
        (err) => {
          this.toast.error('Overtime can not be Created', 'Error!');
        });
    }
    if (this.changeMode == 'Update') {
      this.payrollService.updateOvertime(this.selectedRecord?._id, this.overtimeForm.value).subscribe((res: any) => {
        this.getOvertime();
        this.selectedUserId = null;
        this.overtimeForm.reset();
        this.changeMode = 'Add';
        this.toast.success('Overtime Updated', 'Successfully!');
        this.closeDialog();
      },
        err => {
          this.toast.error('Overtime can not be Updated', 'Error!');
        });
    }
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteOvertime(_id).subscribe((res: any) => {
      this.getOvertimeByPayroll();
      this.toast.success('Successfully Deleted!!!', 'Payroll Overtime');
    },
      (err) => {
        this.toast.error('This Leave is already being used! Payroll Overtime, Can not be deleted!')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }
}