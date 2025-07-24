import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { MatTableDataSource } from '@angular/material/table';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

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
  templates: any[] = [];
  showApprovers: boolean = false;
  displayedColumns: string[] = ['user', 'leaveTemplate', 'primaryApprover', 'secondaryApprover', 'actions'];
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100];
  allData: any[] = [];
  dialogRef: MatDialogRef<any> | null = null;
  columns: TableColumn[] = [
    { key: this.translate.instant('leave.leaveassignment.employee'), name: 'Employee', valueFn: (row) => this.getUser(row?.user) },
    { key: this.translate.instant('leave.leaveassignment.leaveTemplate'), name: 'Current Leave Policy', valueFn: (row) => row?.leaveTemplate?.label },
    { key: this.translate.instant('leave.leaveassignment.primaryApprover'), name: 'Approver', valueFn: (row) => this.getUser(row.primaryApprover) },
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
    private modalService: NgbModal,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private dialog: MatDialog,
    private translate: TranslateService,
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
    this.getAllUsers();
    this.getTemplateAssignments();
    this.templateAssignmentForm.get('leaveTemplate')?.valueChanges.subscribe(value => {
      this.onTemplateChange(value);
    });
  }

  open(content: any) {
    this.getAllTemplates();
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
    });
    this.dialogRef.afterClosed().subscribe(result => {
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
  }

  onSubmission() {
    if (this.templateAssignmentForm.invalid) {
      this.templateAssignmentForm.markAllAsTouched();
      return;
    }

    this.templateAssignmentForm.get('primaryApprover').enable();
    this.templateAssignmentForm.get('user').enable();

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
        error: (err) => {
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
        error: (err) => {
          this.toast.error(this.translate.instant('leave.errorAssignmentUpdated'), this.translate.instant('leave.templateAssignment.title'));
        }
      });
    }
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe({
      next: (res: any) => {
        this.users = res.data.data || [];
      },
      error: (err) => {
        console.error('Error fetching users:', err);
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
    this.leaveService.getLeaveTemplateAssignment(pagination).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.tableService.setData(res.data || []);
          this.allData = res.data;
          this.tableService.totalRecords = res.total || 0;
        }
      },
      error: (err) => {
        console.error('Error fetching template assignments:', err);
        this.tableService.setData([]);
        this.tableService.totalRecords = 0;
      }
    });
  }

  onTemplateChange(templateId: string): void {
    const selectedTemplate = this.templates.find(temp => temp._id === templateId);
    const primaryApproverControl = this.templateAssignmentForm.get('primaryApprover');
    if (selectedTemplate) {
      if (selectedTemplate.approvalType === 'template-wise') {
        primaryApproverControl?.disable();
        primaryApproverControl?.clearValidators();
        this.templateAssignmentForm.patchValue({
          primaryApprover: selectedTemplate.primaryApprover || null,
          secondaryApprover: null
        });
      } else {
        this.showApprovers = true;
        primaryApproverControl?.enable();
        primaryApproverControl?.setValidators(Validators.required);

        if (!this.isEdit || (this.isEdit && this.selectedLeaveAssignment?.leaveTemplate?._id !== templateId)) {
          this.templateAssignmentForm.patchValue({
            primaryApprover: '',
            secondaryApprover: ''
          });
        }
      }
    } else {
      this.showApprovers = true;
      primaryApproverControl?.enable();
      primaryApproverControl?.setValidators(Validators.required);
      this.templateAssignmentForm.patchValue({
        primaryApprover: '',
        secondaryApprover: ''
      });
    }
    primaryApproverControl?.updateValueAndValidity();
  }

  getUser(employeeId: string): string {
    if (!employeeId) return '';
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }


  editTemplateAssignment(templateAssignment: any) {
    this.isEdit = true;
    this.selectedLeaveAssignment = templateAssignment;
    this.templateAssignmentForm.patchValue({
      user: templateAssignment.user || '',
      leaveTemplate: templateAssignment?.leaveTemplate?.label || '',
    });
    this.templateAssignmentForm.get('user').disable();
    this.onTemplateChange(templateAssignment?.leaveTemplate?._id);
    if (this.selectedLeaveAssignment?.primaryApprover && this.selectedLeaveAssignment?.leaveTemplate?.approvalType === 'template-wise') {
      this.templateAssignmentForm.patchValue({
        primaryApprover: templateAssignment.primaryApprover || '',
        secondaryApprover: null
      });
      this.templateAssignmentForm.get('primaryApprover').disable();
    }
    else{
      this.templateAssignmentForm.patchValue({
        primaryApprover: templateAssignment.primaryApprover || '',
        secondaryApprover: null
      })
    }
  }

  deleteTemplateAssignment(_id: string) {
    this.leaveService.deleteTemplateAssignment(_id).subscribe({
      next: (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(this.translate.instant('leave.successAssignmentDeleted'), this.translate.instant('leave.templateAssignment.title'));
      },
      error: (err) => {
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
      this.isEdit = true;
      this.editTemplateAssignment(event?.row);
      this.open(addModal);
    }
    if (event.action.label === 'Delete') {
      this.deleteDialog(event?.row._id);
    }
  }

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getTemplateAssignments();
  }

  onSortChange(event: any) {
    const sorted = this.tableService.dataSource.data.slice().sort((a: any, b: any) => {
      const valueA = a[event.active];
      const valueB = b[event.active];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.tableService.dataSource.data = sorted;
  }

  onSearchChange(event: any) {
    this.tableService.dataSource.data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        if (col.key !== 'actions') {
          var value = row[col.key];
          if (col.key === this.translate.instant('leave.leaveassignment.employee')) {
            value = this.getUser(row[col.key]);
          }
          else if (col.key === this.translate.instant('leave.leaveassignment.leaveTemplate')) {
            value = row[col.key];
          }
          else if (col.key === this.translate.instant('leave.leaveassignment.primaryApprover')) {
            value = this.getUser(row[col.key]);
          }
          else if (col.key === this.translate.instant('leave.leaveassignment.secondaryApprover')) {
            value = this.getUser(row[col.key]);
          }
          return value?.toString().toLowerCase().includes(event.toLowerCase());
        }
        return false;
      });
      return found;
    });
  }

  closeModal() {
    this.resetForm();
    this.dialogRef.close(true);
  }
}