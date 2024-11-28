import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
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

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private toast: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private payrollService: PayrollService,
    private attendanceService: AttendanceService
  ) {
    this.overtimeForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      // Overtime: ['', Validators.required],
      LateComing: ['', Validators.required],
      EarlyGoing: ['', Validators.required],
      FinalOvertime: ['', Validators.required]
    });
    this.onFormValueChanges();
  }

  ngOnInit() {
    this.getAllUsers();

  }

  onFormValueChanges(): void {
    this.overtimeForm.valueChanges.subscribe(() => {
      const selectedOvertimeId = this.overtimeForm.get('Overtime')?.value;
      const overtimeRecord = this.overtimeInformation.find(o => o._id === selectedOvertimeId);
      const overtimeInMinutes = overtimeRecord ? overtimeRecord.OverTime : 0;
      const lateComingInHours = this.overtimeForm.get('LateComing')?.value || 0;
      const earlyGoingInHours = this.overtimeForm.get('EarlyGoing')?.value || 0;

      const lateComingInMinutes = lateComingInHours * 60;
      const earlyGoingInMinutes = earlyGoingInHours * 60;

      const finalOvertimeInMinutes = overtimeInMinutes - (lateComingInMinutes + earlyGoingInMinutes);

      this.overtimeForm.get('FinalOvertime')?.setValue(finalOvertimeInMinutes, { emitEvent: false });
    });
  }

  onUserSelectedFromChild(user: any) {
    this.selectedUserId = user;
    this.getOvertime();
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

  open(content: any) {
    this.getAttendanceOvertimeInformation();
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
      })
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


  getAttendanceOvertimeInformation() {
    let payload = { skip: '', next: '' }
    this.attendanceService.getOverTime(payload.skip, payload.next).subscribe((res: any) => {
      this.overtimeInformation = res.data;
    })
  }

  getOvertime() {
    console.log(this.selectedUserId?._id);
    this.payrollService.getOvertime(this.selectedUserId?._id).subscribe((res: any) => {
      this.overtime = res.data.records;
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
      }
    );
  }

  onSubmission() {
    this.overtimeForm.value.PayrollUser = this.selectedUserId._id;
    if (this.changeMode == 'Add') {
      this.payrollService.addOvertime(this.overtimeForm.value).subscribe((res: any) => {
        this.getOvertime();
        this.overtimeForm.reset();
        this.toast.success('Overtime Created', 'Successfully!');
        this.modalService.dismissAll();
      },
        (err) => {
          this.toast.error('Overtime can not be Created', 'Error!');
        })
    }
    if (this.changeMode == 'Update') {
      this.payrollService.updateOvertime(this.selectedRecord?._id, this.overtimeForm.value).subscribe((res: any) => {
        this.getOvertime();
        this.selectedUserId = null;
        this.overtimeForm.reset();
        this.changeMode = 'Add';
        this.toast.success('Overtime Updated', 'Successfully!');
        this.modalService.dismissAll();
      },
        err => {
          this.toast.error('Overtime can not be Updated', 'Error!');
        })
    }
  }

  deleteTemplate(_id: string) {
    // this.leaveService.deleteTemplate(_id).subscribe((res: any) => {
    //   this.getLeaveTemplates();
    //   if(res != null){
    //     const index = this.templates.findIndex(temp => temp._id === _id);
    //     if (index !== -1) {
    //       this.templates.splice(index, 1);
    //     }
    //   }
    //   this.toast.success('Successfully Deleted!!!', 'Leave Template')
    // },
    //   (err) => {
    //     this.toast.error('This Leave is already being used! Leave template, Can not be deleted!')
    //   })
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