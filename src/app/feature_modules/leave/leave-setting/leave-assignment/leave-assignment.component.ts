import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LeaveService } from 'src/app/_services/leave.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { MatTableDataSource } from '@angular/material/table';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-leave-assignment',
  templateUrl: './leave-assignment.component.html',
  styleUrls: ['./leave-assignment.component.css']
})
export class LeaveAssignmentComponent implements OnInit {
  closeResult: string = '';
  selectedLeaveAssignment: any;
  isEdit: boolean = false;
  templateAssignmentForm: FormGroup;
  users: any[] = [];
  managers: any[];
  templates: any[] = [];
  showApprovers: boolean = false;
  displayedColumns: string[] = ['user', 'leaveTemplate', 'primaryApprover', 'secondaryApprover', 'actions'];
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100];
  leaveApplication = new MatTableDataSource<any>();
  allData: any[] = [];
  dialogRef: MatDialogRef<any> | null = null;
  isSubmitting: boolean = false;
  alreadyExist: boolean = false;

  columns: TableColumn[] = [
    { key: this.translate.instant('leave.leaveassignment.employee'), name: 'Employee', valueFn: (row) => row?.user },
    { key: this.translate.instant('leave.leaveassignment.leaveTemplate'), name: 'Current Leave Policy', valueFn: (row) => row?.leaveTemplate?.label },
    { key: this.translate.instant('leave.leaveassignment.primaryApprover'), name: 'Approver', valueFn: (row) => row.primaryApprover },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private teamService: ManageTeamService,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private commonService: CommonService,
    public tableService: TableService<any>
  ) {
    this.templateAssignmentForm = this.fb.group({
      user: ['', Validators.required],
      leaveTemplate: ['', Validators.required],
      primaryApprover: [''],
      secondaryApprover: ['']
    });
  }

  ngOnInit(): void {
    this.getManagers();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
    this.getTemplateAssignments();
    this.templateAssignmentForm.get('leaveTemplate')?.valueChanges.subscribe(value => {
      this.onTemplateChange(value);
    });
  }

  open(content: any) {
    this.isSubmitting = false;
    this.getAllTemplates();
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.resetForm();
      this.getTemplateAssignments();
    });
  }

  resetForm() {
    this.isEdit = false;
    this.showApprovers = false;
    this.selectedLeaveAssignment = null;
    this.templateAssignmentForm.reset({
      user: '',
      leaveTemplate: '',
      primaryApprover: '',
      secondaryApprover: ''
    });
    this.templateAssignmentForm.get('user').enable();
    this.templateAssignmentForm.get('primaryApprover').enable();
  }

  isUserAlreadyAssigned(userId: any) {
    this.alreadyExist = false;
    if (this.allData.some(assignment => assignment.userId === userId)) {
      this.alreadyExist = true;
      this.toast.warning(this.translate.instant('leave.leaveAssignmentAlreadyExist'))
    }
  }

  onSubmission() {
    this.isSubmitting = true;
    if (this.templateAssignmentForm.invalid) {
      this.templateAssignmentForm.markAllAsTouched();
      return;
    }

    this.templateAssignmentForm.get('user').enable();
    this.templateAssignmentForm.get('primaryApprover').enable();
    const payload = {
      user: this.templateAssignmentForm.value.user,
      leaveTemplate: this.templateAssignmentForm.value.leaveTemplate,
      primaryApprover: this.templateAssignmentForm.value.primaryApprover,
      secondaryApprover: null
    };

    if (!this.isEdit) {
      this.leaveService.addLeaveTemplateAssignment(payload).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            const currentData = this.tableService.dataSource.data;
            this.tableService.setData([...currentData, res.data]);

            this.toast.success(this.translate.instant('leave.successAssigned'), this.translate.instant('leave.templateAssignment.title'));
            this.resetForm();
            this.closeModal();
          }
        },
        error: () => {
          this.toast.error(this.translate.instant('leave.errorAssigned'), this.translate.instant('leave.templateAssignment.title'));
        }
      });
    } else {
      this.leaveService.addLeaveTemplateAssignment(payload).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            const updatedData = this.tableService.dataSource.data.map(item =>
              item._id === res.data._id ? res.data : item
            );
            this.tableService.setData(updatedData);
            this.toast.success(this.translate.instant('leave.successAssignmentUpdated'), this.translate.instant('leave.templateAssignment.title'));
            this.resetForm();
            this.closeModal();
          }
        },
        error: () => {
          this.toast.error(this.translate.instant('leave.errorAssignmentUpdated'), this.translate.instant('leave.templateAssignment.title'));
        }
      });
    }
  }

  getManagers() {
    this.teamService.getManagers().subscribe((res: any) => {
      this.managers = res.data;
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingUsers'));
      }
    });
  }

  getAllTemplates() {
    const requestBody = { skip: '0', next: '100000' };
    this.leaveService.getLeavetemplates(requestBody).subscribe({
      next: (res: any) => {
        this.templates = res.data || [];
      },
      error: (err) => {
        console.error('Error fetching templates:', err);
      }
    });
  }

  getTemplateAssignments() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.leaveService.getLeaveTemplateAssignment(pagination).subscribe((res: any) => {
      if (res.status === 'success') {
        this.leaveApplication.data = res.data.map((leave: any) => {
          return {
            ...leave,
            primaryApprover: leave.primaryApprover.firstName + ' ' + leave.primaryApprover.lastName,
            primaryAproverId: leave.primaryApprover._id,
            user: leave.user.firstName + ' ' + leave.user.lastName,
            userId: leave.user._id
          }
        });
        this.allData = this.leaveApplication.data || [];
      }
    },
      error => {
        this.toast.error(error.message)
      })
  }

  onTemplateChange(templateId: string): void {
    const selectedTemplate = this.templates.find(temp => temp._id === templateId);
    const primaryApproverControl = this.templateAssignmentForm.get('primaryApprover');
    if (selectedTemplate?.approvalType === 'template-wise') {

      this.templateAssignmentForm.patchValue({
        primaryApprover: selectedTemplate.primaryApprover || null,
        secondaryApprover: null
      });

      primaryApproverControl?.disable();
      primaryApproverControl?.clearValidators();
      this.showApprovers = false;
    } else {
      primaryApproverControl?.enable();
      primaryApproverControl?.setValidators(Validators.required);
      this.templateAssignmentForm.patchValue({
        primaryApprover: this.isEdit ? this.selectedLeaveAssignment?.primaryApprover || '' : '',
        secondaryApprover: null
      });
      this.showApprovers = true;
    }
    primaryApproverControl?.updateValueAndValidity();
  }

  editTemplateAssignment(templateAssignment: any) {
    this.isEdit = true;
    this.selectedLeaveAssignment = templateAssignment;
    console.log(templateAssignment)
    this.templateAssignmentForm.patchValue({
      user: templateAssignment.userId || '',
      leaveTemplate: templateAssignment.leaveTemplate?._id || '',
      primaryApprover: templateAssignment.primaryAproverId
    });
    this.templateAssignmentForm.get('user').disable();
    // this.onTemplateChange(templateAssignment.leaveTemplate?._id);
  }

  deleteTemplateAssignment(_id: string) {
    this.leaveService.deleteTemplateAssignment(_id).subscribe({
      next: (res: any) => {
        this.getTemplateAssignments();
        this.toast.success(this.translate.instant('leave.successAssignmentDeleted'), this.translate.instant('leave.templateAssignment.title'));
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorAssignmentDeleted'), this.translate.instant('leave.templateAssignment.title'));
      }
    });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplateAssignment(id);
      }
    });
  }

  handleAction(event: any, addModal: any) {
    if (event.action.label === 'Edit') {
      this.editTemplateAssignment(event.row);
      this.open(addModal);
    }
    if (event.action.label === 'Delete') {
      this.deleteDialog(event.row._id);
    }
  }

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getTemplateAssignments();
  }

  onSortChange(event: any) {
    const sorted = this.leaveApplication.data.slice().sort((a: any, b: any) => {
      const valueA = a[event.active];
      const valueB = b[event.active];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.leaveApplication.data = sorted;
  }

  onSearchChange(event: string) { // CHANGED: Updated to match reference
    this.leaveApplication.data = this.allData.filter(row => {
      return this.columns.some(col => {
        if (col.key !== 'actions') {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(event.toLowerCase());
        }
        return false;
      });
    });
  }
  closeModal() {
    this.resetForm();
    this.dialogRef.close(true);
  }
}