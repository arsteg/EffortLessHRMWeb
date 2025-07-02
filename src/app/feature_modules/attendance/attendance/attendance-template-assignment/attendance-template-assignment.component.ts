import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ActionVisibility } from 'src/app/models/table-column';

@Component({
  selector: 'app-attendance-template-assignment',
  templateUrl: './attendance-template-assignment.component.html',
  styleUrl: './attendance-template-assignment.component.css'
})
export class AttendanceTemplateAssignmentComponent {
  closeResult: string = '';
  p: number = 1;
  step: number = 1;
  searchText: string = '';
  isEdit: boolean = false;
  attendanceTemplateAssignment: any;
  selectedTemplate: any;
  changeMode: 'Add' | 'Update' = 'Add';
  attendanceTemplateAssignmentForm: FormGroup;
  allAssignee: any[];
  bsValue = new Date();
  templates: any;
  updateTemplateAssignForm: FormGroup;
  templateById: any;
  selectedTemp: any;
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';
  userHasTemplateError: boolean = false;
  @ViewChild('addModal') addModal: any;
  @ViewChild('editModal') editModal: any;
  dialogRef: MatDialogRef<any> | null = null;
  private cdr: ChangeDetectorRef;

  columns = [
      {
        key: 'employee',
        name: 'Employee Name',
        sortable: true,
        valueFn: (row: any) => this.getUser(row.employee)
      },
      {
        key: 'attendanceTemplate',
        name: 'Assigned Attendance Template',
        sortable: true,
        valueFn: (row: any) => row.attendanceTemplate?.label
      },
      {
        key: 'primaryApprover',
        name: 'Primary Supervisor',
        sortable: true,
        valueFn: (row: any) => this.getUser(row.primaryApprover)
      },
      {
        key: 'secondaryApprover',
        name: 'Secondary Supervisor',
        sortable: true,
        valueFn: (row: any) => this.getUser(row.secondaryApprover)
      },
      {
        key: 'effectiveFrom',
        name: 'Effective Date',
        sortable: true,
        valueFn: (row: any) => new Date(row.effectiveFrom).toLocaleDateString()
      },
      {
        key: 'actions',
        name: 'Actions',
        isAction: true,
        options: [
          {
            label: 'Edit',
            icon: 'edit',
            visibility: ActionVisibility.LABEL,
            hideCondition: (row: any) => row.attendanceTemplate?.approversType !== 'employee-wise'
          },
          {
            label: 'Delete',
            icon: 'delete',
            visibility: ActionVisibility.LABEL
          }
        ]
      }
    ];

  constructor(private modalService: NgbModal,
    private exportService: ExportService,
    private attendanceService: AttendanceService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.attendanceTemplateAssignmentForm = this.fb.group({
      employee: ['', Validators.required],
      attendanceTemplate: ['', Validators.required],
      effectiveFrom: [, Validators.required],
      primaryApprover: ['', Validators.required],
      secondaryApprover: ['', Validators.required]
    });
    this.updateTemplateAssignForm = this.fb.group({
      primaryApprovar: [{ value: '', disabled: true }, Validators.required],
      secondaryApprovar: [{ value: '', disabled: true }, Validators.required]
    })
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getAllTemplates();
    this.loadRecords();
  }

  // onEmployeeChange(event: any) {
  //   const selectedEmployeeId = event.value;
  //   this.userHasTemplateError = this.attendanceTemplateAssignment.some(
  //     (assignment: any) => assignment.employee === selectedEmployeeId
  //   );
  // }
  onEmployeeChange(event: any) {
    const selectedEmployeeId = event.value;
    const employeeControl = this.attendanceTemplateAssignmentForm.get('employee');
    
    if (selectedEmployeeId) {
      this.userHasTemplateError = this.attendanceTemplateAssignment.some(
        (assignment: any) => assignment.employee === selectedEmployeeId
      );
      if (this.userHasTemplateError) {
        employeeControl?.setErrors({ employeeAlreadyAssigned: true });
      } else {
        const errors = employeeControl?.errors ? { ...employeeControl.errors } : {};
        delete errors['employeeAlreadyAssigned'];
        employeeControl?.setErrors(Object.keys(errors).length ? errors : null);
      }
    } else {
      this.userHasTemplateError = false;
      const errors = employeeControl?.errors ? { ...employeeControl.errors } : {};
      delete errors['employeeAlreadyAssigned'];
      employeeControl?.setErrors(Object.keys(errors).length ? errors : null);
    }
    this.cdr.detectChanges();
  }

  onPageChange(page: any) {
    this.currentPage = page;
    this.loadRecords();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.loadRecords();
  }

  loadRecords() {
    const pagination = {
      skip: "1",//((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: "100000"//this.recordsPerPage.toString()
    };
    this.attendanceService.getAttendanceAssignment(pagination.skip, pagination.next).subscribe((res: any) => {
      this.attendanceTemplateAssignment = res.data;
      this.totalRecords = res.total;
    })

  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
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

  // open(content: any) {
  //   this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }

  open(content: string) {
    if (content === 'add') {
      this.changeMode = 'Add';
      this.isEdit = false;
      this.dialogRef = this.dialog.open(this.addModal, {
        width: '600px',
        disableClose: true
      });
      this.dialogRef.afterClosed().subscribe(result => {
        // if (result) {
        //   this.onCreate(); // Call onCreate if form is submitted
        // }
      });
    } else if (content === 'edit') {
      this.changeMode = 'Update';
      this.isEdit = true;
      this.dialogRef = this.dialog.open(this.editModal, {
        width: '600px',
        disableClose: true
      });

      this.dialogRef.afterClosed().subscribe(result => {
        // if (result) {
        //   this.onUpdate(); // Call onUpdate if form is submitted
        // }
      });
    }
  }

  setFormValues(formValue: any) {
    this.isEdit = true;
    this.attendanceService.getAttendanceTemplateById(this.selectedTemplate.attendanceTemplate?._id).subscribe((res: any) => {
      this.templateById = res.data;

      if (this.templateById.approversType === 'template-wise') {
        if (this.templateById.approvalLevel === '1') {
          this.updateTemplateAssignForm.patchValue({
            primaryApprovar: this.templateById.primaryApprover,
            secondaryApprovar: null
          });
          this.updateTemplateAssignForm.get('primaryApprovar').disable();

        } else if (this.templateById.approvalLevel === '2') {
          this.updateTemplateAssignForm.patchValue({
            primaryApprovar: this.templateById.primaryApprover,
            secondaryApprovar: this.templateById.secondaryApprover
          });
        }
        this.updateTemplateAssignForm.get('primaryApprovar').disable();
        this.updateTemplateAssignForm.get('secondaryApprovar').disable();

      }
      else if (this.templateById.approversType === 'employee-wise') {
        this.attendanceService.getAttendanceAssignmentById(this.selectedTemplate._id).subscribe((res: any) => {
          const response = res.data;
          this.updateTemplateAssignForm.patchValue({
            primaryApprovar: response.primaryApprover,
            secondaryApprovar: response.secondaryApprover
          });
        })
        console.log(this.templateById, this.updateTemplateAssignForm.value)
        this.updateTemplateAssignForm.get('primaryApprovar').enable();
        this.updateTemplateAssignForm.get('secondaryApprovar').enable();
      }
    })
  }

  // exportToCsv() {
  //   const dataToExport = this.attendanceTemplateAssignment.map((tempAssign) => ({
  //     employee: this.getUser(tempAssign?.employee),
  //     effectiveFrom: tempAssign.effectiveFrom,
  //     primaryApprover: this.getUser(tempAssign?.primaryApprover),
  //     secondaryApprover: this.getUser(tempAssign?.secondaryApprover)
  //   }));
  //   this.exportService.exportToCSV('attendance-template-assignment', 'attendance-template-assignment', dataToExport);
  // }

  // closeModal() {
  //   this.modalService.dismissAll();
  // }
  onTemplateSelectionChange(event: any) {
    const selectedTemplateId = event.value;
    this.selectedTemp = selectedTemplateId;
    this.attendanceService.getAttendanceTemplateById(selectedTemplateId).subscribe((res: any) => {
      this.templateById = res.data;
      console.log(this.templateById)
      if (this.templateById.approversType === 'template-wise') {
        if (this.templateById.approvalLevel === '1') {
          this.attendanceTemplateAssignmentForm.patchValue({
            primaryApprover: this.templateById.primaryApprover,
            secondaryApprover: null
          });
          this.attendanceTemplateAssignmentForm.get('primaryApprover').disable();

        } else if (this.templateById.approvalLevel === '2') {
          this.attendanceTemplateAssignmentForm.patchValue({
            primaryApprover: this.templateById.primaryApprover,
            secondaryApprover: this.templateById.secondaryApprover
          });
        }
        this.attendanceTemplateAssignmentForm.get('primaryApprover').disable();
        this.attendanceTemplateAssignmentForm.get('secondaryApprover').disable();

      }
      else if (this.templateById.approversType === 'employee-wise') {
        this.attendanceTemplateAssignmentForm.patchValue({
          primaryApprover: this.templateById.primaryApprover,
          secondaryApprover: this.templateById.secondaryApprover
        });
        console.log(this.templateById, this.updateTemplateAssignForm.value)
        this.attendanceTemplateAssignmentForm.get('primaryApprover').enable();
        this.attendanceTemplateAssignmentForm.get('secondaryApprover').enable();
      }

    });

  }
  getTemplateById() {
    this.attendanceService.getAttendanceTemplateById(this.selectedTemplate.attendanceTemplate).subscribe((res: any) => {
      this.templateById = res.data;

      if (this.templateById.approversType === 'template-wise') {
        if (this.templateById.approvalLevel === '1') {
          this.updateTemplateAssignForm.patchValue({
            primaryApprovar: this.templateById.primaryApprover,
            secondaryApprovar: null
          });
          this.updateTemplateAssignForm.get('primaryApprovar').disable();

        } else if (this.templateById.approvalLevel === '2') {
          this.updateTemplateAssignForm.patchValue({
            primaryApprovar: this.templateById.primaryApprover,
            secondaryApprovar: this.templateById.secondaryApprover
          });
        }
        this.updateTemplateAssignForm.get('primaryApprovar').disable();
        this.updateTemplateAssignForm.get('secondaryApprovar').disable();

      }
      else if (this.templateById.approversType === 'employee-wise') {
        this.updateTemplateAssignForm.patchValue({
          primaryApprovar: this.templateById.primaryApprover,
          secondaryApprovar: this.templateById.secondaryApprover
        });
        console.log(this.templateById, this.updateTemplateAssignForm.value)
        this.updateTemplateAssignForm.get('primaryApprovar').enable();
        this.updateTemplateAssignForm.get('secondaryApprovar').enable();
      }
    })
  }

  getAllTemplates() {
    this.attendanceService.getAttendanceTemplate('', '').subscribe((res: any) => {
      this.templates = res.data;
    })
  }

  onCreate() {
    const selectedEmployeeId = this.attendanceTemplateAssignmentForm.get('employee')?.value;

    // Check if the employee already has a template assigned
    const isAlreadyAssigned = this.attendanceTemplateAssignment.some(
      (assignment: any) => assignment.employeeId === selectedEmployeeId
    );

    if (isAlreadyAssigned) {
      this.userHasTemplateError = true; // Show error
      return; // Stop form submission
    }

    this.userHasTemplateError = false;
    if (this.attendanceTemplateAssignmentForm.valid) {
      this.attendanceService.getAttendanceTemplateById(this.selectedTemp).subscribe((res: any) => {
        this.templateById = res.data;
        let payload = {
          employee: this.attendanceTemplateAssignmentForm.value.employee,
          attendanceTemplate: this.attendanceTemplateAssignmentForm.value.attendanceTemplate,
          effectiveFrom: this.attendanceTemplateAssignmentForm.value.effectiveFrom,
          primaryApprover: this.attendanceTemplateAssignmentForm.value.primaryApprover,
          secondaryApprover: this.attendanceTemplateAssignmentForm.value.secondaryApprover
        }
        if (this.templateById.approversType == 'template-wise' && this.templateById.approvalLevel == '2') {
          payload.primaryApprover = this.templateById.primaryApprover,
            payload.secondaryApprover = this.templateById.secondaryApprover
        }
        else if (this.templateById.approversType == 'template-wise' && this.templateById.approvalLevel == '1') {
          payload.primaryApprover = this.templateById.primaryApprover,
            payload.secondaryApprover = null
        }
        this.attendanceService.addAttendanceAssignment(payload).subscribe((res: any) => {
          this.loadRecords();
          this.toast.success('Attendance Template Assigned', 'Successfully');
          this.dialogRef.close(true);
          this.attendanceTemplateAssignmentForm.reset({
            employee: '',
            attendanceTemplate: '',
            effectiveFrom: new Date(),
            primaryApprover: '',
            secondaryApprover: ''
          });
        });
      });
    }
    else {
      this.markFormGroupTouched(this.attendanceTemplateAssignmentForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onUpdate() {
    if (this.updateTemplateAssignForm.valid) {
      let payload = {
        primaryApprovar: this.updateTemplateAssignForm.value.primaryApprovar,
        secondaryApprovar: this.updateTemplateAssignForm.value.secondaryApprovar
      }
      this.attendanceService.updateAttendanceAssignment(this.selectedTemplate._id, payload).subscribe((res: any) => {
        this.toast.success('Successfully Updated!!!', 'Attendance Template Assignment')
        this.loadRecords();
        this.dialogRef.close(true);
      },
        err => {
          this.toast.error('Attendance Template Assignment can not be updated', 'Error!')
        })
    }
    else {
      this.markFormGroupTouched(this.updateTemplateAssignForm);
    }
  }

  deleteTempAssignment(id: string) {
    this.attendanceService.deleteAttendanceAssignment(id).subscribe((res: any) => {
      this.loadRecords();
      this.toast.success('Successfully Deleted!!!', 'Attendance Template Assignment')
    },
      (err) => {
        this.toast.error('This Template Assignment Can not be deleted'
          , 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteTempAssignment(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

  onAction(event: { action: any, row: any }) {
    if (event.action.label === 'Edit') {
      this.selectedTemplate = event.row;
      this.isEdit = true;
      this.setFormValues(event.row);
      this.open('edit');
    } else if (event.action.label === 'Delete') {
      this.deleteDialog(event.row._id);
    }
  }
}
