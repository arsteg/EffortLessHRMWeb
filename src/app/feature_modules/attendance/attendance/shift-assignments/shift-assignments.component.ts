import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-shift-assignments',
  templateUrl: './shift-assignments.component.html',
  styleUrl: './shift-assignments.component.css'
})
export class ShiftAssignmentsComponent {
  isEdit: boolean;
  searchText: string = '';
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  shift: any;
  p: number = 1;
  selectedShift: any;
  shiftForm: FormGroup;
  bsValue = new Date();
  allAssignee: any;
  shiftAssigments: any;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';
  userHasTemplateError: boolean = false;

  constructor(private attendanceService: AttendanceService,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private commonService: CommonService,
    private fb: FormBuilder) {
    this.shiftForm = this.fb.group({
      template: ['', Validators.required],
      user: ['', Validators.required],
      startDate: [null, [Validators.required, this.futureDateValidator()]]
    })
  }
  ngOnInit() {
    this.getshift();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.loadRecords();
  }

  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = control.value;

      if (!selectedDate) {
        return null; // If no date is selected, let Validators.required handle it
      }

      // Normalize dates to remove time component for accurate comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today

      const dateToCompare = new Date(selectedDate);
      dateToCompare.setHours(0, 0, 0, 0); // Set to start of selected date

      if (dateToCompare.getTime() < today.getTime()) {
        return { pastDate: true }; // Return 'pastDate' error if it's a previous date
      }
      return null; // Valid date
    };
  }
  
  onEmployeeChange(event: any) {
    const selectedEmployeeId = event.target.value;
    this.userHasTemplateError = this.shiftAssigments.some(
      (assignment: any) => assignment.user === selectedEmployeeId
    );
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRecords();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.loadRecords();
  }

  loadRecords() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.attendanceService.getShiftAssignment(pagination.skip, pagination.next).subscribe((res: any) => {
      this.shiftAssigments = res.data;
      this.totalRecords = res.total;
    })

  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }
  getShiftTemplateName(templateId: string) {
    const template = this.shift?.find(temp => temp._id === templateId);
    return template ? template.name : '';
  }

  getshift() {
    this.attendanceService.getShift('', '').subscribe((res: any) => {
      this.shift = res.data;
    })
  }

  clearForm() {
    this.shiftForm.reset({
      user: '',
      template: '',
      startDate: new Date()
    });
    this.shiftForm.get('user').enable();
    this.userHasTemplateError = false;
  }
  closeModal() {
    this.modalService.dismissAll();
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

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  exportToCsv() {
    const dataToExport = this.shiftAssigments.map((data) => ({
      user: this.getUser(data.user),
      template: this.getShiftTemplateName(data.template),
      startDate: data.startDate
    }));
    this.exportService.exportToCSV('Shift-Assignment', 'Shift-Assignment', dataToExport);

  }

  setFormValues(data) {
    this.shiftForm.patchValue({
      template: data.template,
      user: data.user,
      startDate: data.startDate
    });
    if (this.isEdit) {
      this.shiftForm.get('user').disable();
      this.userHasTemplateError = false;
    }
  }

  onSubmission() {
    if (this.shiftForm.valid) {
      if (!this.isEdit) {
        this.attendanceService.addShiftAssignment(this.shiftForm.value).subscribe((res: any) => {
          this.loadRecords();
          this.toast.success('Shift Template Assigned', 'Successfully');
          this.shiftForm.reset({
            user: '',
            template: '',
            startDate: new Date()
          });
          this.shiftForm.get('user').enable();
          this.isEdit = false;
        },
          err => {
            this.toast.error('Shift Template Can not be Assigned', 'ERROR')
          })
      }
      else {
        this.attendanceService.updateShiftAssignment(this.selectedShift, this.shiftForm.value).subscribe((res: any) => {
          this.loadRecords();
          this.shiftForm.reset({
            user: '',
            template: '',
            startDate: new Date()
          });
          this.shiftForm.get('user').enable();
          this.isEdit = false,
            this.toast.success('Shift Template Assignment Updated', 'Succesfully')
        },
          err => {
            this.toast.error('Shift Template Assignment Can not be Updated', 'ERROR')
          })
      }
    }
    else {
      this.toast.error('Please fill the required Fields')
      this.markFormGroupTouched(this.shiftForm);
    }
    this.isEdit = false;
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  deleteTemplate(id: string) {
    this.attendanceService.deleteShiftAssignment(id).subscribe((res: any) => {
      this.loadRecords();
      this.toast.success('Successfully Deleted!!!', 'Shift Template Assignment');
    },
      (err) => {
        this.toast.error('This Shift Template Assignment Can not be deleted', 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
}
