import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-leave-assignment',
  templateUrl: './leave-assignment.component.html',
  styleUrls: ['./leave-assignment.component.css']
})
export class LeaveAssignmentComponent implements OnInit, AfterViewInit {
  closeResult: string = '';
  selectedLeaveAssignment: any;
  isEdit: boolean = false;
  templateAssignmentForm: FormGroup;
  users: any[] = [];
  templates: any[] = [];
  showApprovers: boolean = false;
  displayedColumns: string[] = ['user', 'leaveTemplate', 'primaryApprover', 'secondaryApprover', 'actions'];
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100];

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
    this.getAllTemplates();
    this.initializeFilterPredicate();
    this.templateAssignmentForm.get('leaveTemplate')?.valueChanges.subscribe(value => {
      this.onTemplateChange(value);
    });
  }

  ngAfterViewInit() {
    this.tableService.dataSource.paginator = this.paginator;
    this.getTemplateAssignments();
  }

  initializeFilterPredicate() {
    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      const searchString = filter.trim().toLowerCase();
      const userName = this.getUser(data.user)?.toLowerCase() || '';
      const templateLabel = this.getTemplateLabel(data.leaveTemplate)?.toLowerCase() || '';
      const primaryApproverName = this.getUser(data.primaryApprover)?.toLowerCase() || '';
      const secondaryApproverName = this.getUser(data.secondaryApprover)?.toLowerCase() || '';
      return userName.includes(searchString) ||
             templateLabel.includes(searchString) ||
             primaryApproverName.includes(searchString) ||
             secondaryApproverName.includes(searchString);
    });
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        this.resetForm();
        this.getTemplateAssignments();
      }
    );
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

    const payload = {
      user: this.templateAssignmentForm.value.user,
      leaveTemplate: this.templateAssignmentForm.value.leaveTemplate,
      primaryApprover: this.showApprovers ? this.templateAssignmentForm.value.primaryApprover || null : null,
      secondaryApprover: this.showApprovers ? this.templateAssignmentForm.value.secondaryApprover || null : null
    };

    if (!this.isEdit) {
      this.leaveService.addLeaveTemplateAssignment(payload).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            const currentData = this.tableService.dataSource.data;
            this.tableService.setData([...currentData, res.data]);
            this.toast.success(this.translate.instant('leave.successAssigned'), this.translate.instant('leave.title'));
            this.resetForm();
            this.modalService.dismissAll();
          }
        },
        error: (err) => {
          this.toast.error(this.translate.instant('leave.errorAssigned'), this.translate.instant('leave.title'));
        }
      });
    } else {
      const id = this.selectedLeaveAssignment._id;
      this.leaveService.updateTemplateAssignment(id, payload).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            const updatedData = this.tableService.dataSource.data.map(item =>
              item._id === res.data._id ? res.data : item
            );
            this.tableService.setData(updatedData);
            this.toast.success(this.translate.instant('leave.successAssignmentUpdated'), this.translate.instant('leave.title'));
            this.resetForm();
            this.modalService.dismissAll();
          }
        },
        error: (err) => {
          this.toast.error(this.translate.instant('leave.errorAssignmentUpdated'), this.translate.instant('leave.title'));
        }
      });
    }
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe({
      next: (res: any) => {
        this.users = res.data.data || [];
        this.initializeFilterPredicate();
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
        this.initializeFilterPredicate();
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

  getTemplateLabel(leaveTemplate: string): string {
    const matchingCategory = this.templates.find(template => template?._id === leaveTemplate);
    return matchingCategory?.label || '';
  }

  onTemplateChange(templateId: string): void {
    const selectedTemplate = this.templates.find(temp => temp._id === templateId);
    if (selectedTemplate?.approvalType === 'template-wise') {
      this.showApprovers = false;
      this.templateAssignmentForm.patchValue({
        primaryApprover: '',
        secondaryApprover: ''
      });
    } else {
      this.showApprovers = true;
    }
  }

  getUser(employeeId: string): string {
    if (!employeeId) return '';
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

  editTemplateAssignment(templateAssignment: any) {
    this.isEdit = true;
    this.selectedLeaveAssignment = templateAssignment;
    this.onTemplateChange(templateAssignment.leaveTemplate);
    this.templateAssignmentForm.patchValue({
      user: templateAssignment.user || '',
      leaveTemplate: templateAssignment.leaveTemplate || '',
      primaryApprover: templateAssignment.primaryApprover || '',
      secondaryApprover: templateAssignment.secondaryApprover || ''
    });
  }

  deleteTemplateAssignment(_id: string) {
    this.leaveService.deleteTemplateAssignment(_id).subscribe({
      next: (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(this.translate.instant('leave.successAssignmentDeleted'), this.translate.instant('leave.title'));
      },
      error: (err) => {
        this.toast.error(this.translate.instant('leave.errorAssignmentDeleted'), this.translate.instant('leave.title'));
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

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getTemplateAssignments();
  }
}