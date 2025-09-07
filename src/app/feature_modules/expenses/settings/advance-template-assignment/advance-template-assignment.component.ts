import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
@Component({
  selector: 'app-advance-template-assignment',
  templateUrl: './advance-template-assignment.component.html',
  styleUrl: './advance-template-assignment.component.css'
})

export class AdvanceTemplateAssignmentComponent {
  private readonly translate = inject(TranslateService);
  searchText: '';
  isEdit = false;
  changeMode: 'Add' | 'Update' = 'Add';
  addTemplateAssignmentForm: FormGroup;
  closeResult: string = '';
  advanceTemplates: any;
  templateAssignments: any;
  templateResponse;
  allAssignee: any[];
  availableAssignees: any[] = [];
  selectedTemplateAssignment: any;
  p: number = 1;
  isSubmitted: boolean = false;
  public sortOrder: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  showApproverFields = true;
  templateById: any;
  @ViewChild('primaryApproverField') primaryApproverField: ElementRef;
  @ViewChild('secondaryApproverField') secondaryApproverField: ElementRef;
  displayedColumns: string[] = ['employeeName', 'advanceTemplate', 'primaryApprover', 'effectiveDate', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  dialogRef: MatDialogRef<any>;
  managers: any;
  allData: any[] = [];
  columns: TableColumn[] = [
    { key: 'employeeName', name: this.translate.instant('expenses.user') },
    { key: 'advanceTemplate', name: this.translate.instant('expenses.advance_template') },
    { key: 'primaryApprover', name: this.translate.instant('expenses.primary_approver') },
    {
      key: 'effectiveDate',
      name: this.translate.instant('expenses.effective_date'),
      valueFn: (row: any) => new Date(row.effectiveDate).toLocaleDateString('en-US')
    },
    {
      key: 'action',
      name: this.translate.instant('expenses.actions'),
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  constructor(private fb: FormBuilder,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private manageService: ManageTeamService
  ) {
    this.addTemplateAssignmentForm = this.fb.group({
      user: ['', Validators.required],
      advanceTemplate: ['', Validators.required],
      secondaryApprover: [''],
      primaryApprover: [''],
      effectiveDate: []
    });
  }


  ngOnInit() {
    this.getManagers();
    forkJoin({
      users: this.commonService.populateUsers(),
      templates: this.expenseService.getAdvanceTemplates({ next: '', skip: '' }),
      assignments: this.expenseService.getAdvanceTemplateAssignment({
        skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
        next: this.recordsPerPage.toString()
      })
    }).subscribe(({ users, templates, assignments }) => {
      this.allAssignee = users?.data?.data || [];
      this.advanceTemplates = templates.data;
      this.templateAssignments = assignments.data;
      this.totalRecords = assignments?.total || 0;

      // Filter out users who are already assigned
      const assignedUserIds = this.templateAssignments.map(assignment => assignment.user);
      this.availableAssignees = this.allAssignee.filter(user => !assignedUserIds.includes(user._id));

      this.dataSource.data = this.templateAssignments.map((report) => {
        const expenseAdvanceTemplateDetails = this.getTemplateDetails(report?.advanceTemplate);
        return {
          ...report,
          employeeName: this.getUser(report?.user),
          advanceTemplate: this.getAdvanceTemplate(report?.advanceTemplate),
          primaryApprover: this.getUser(report?.primaryApprover),
          secondaryApprover: this.getUser(report?.secondaryApprover),
          approvalType: expenseAdvanceTemplateDetails?.approvalType
        };
      });
      
      this.allData = this.dataSource.data;
    });


  }
  getManagers() {
    this.manageService?.getManagers().subscribe((res: any) => {
      this.managers = res.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

  getAdvanceTemplate(templateId: string) {
    const matchingTemplate = this.advanceTemplates?.find(temp => temp._id === templateId);
    return matchingTemplate ? matchingTemplate?.policyLabel : '--';
  }

  getAllTemplates() {
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getAdvanceTemplates(payload).subscribe((res: any) => {
      this.advanceTemplates = res.data;
    })
  }

  onCancel() {
    this.isEdit = false;
    this.addTemplateAssignmentForm.reset();
  }

  open(content: any) {
    this.isSubmitted = false;
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });
    if (this.changeMode === 'Add') {
      this.addTemplateAssignmentForm.get('user').enable();
      this.addTemplateAssignmentForm.get('advanceTemplate').enable();
      this.addTemplateAssignmentForm.get('primaryApprover').enable();
      this.addTemplateAssignmentForm.get('effectiveDate').enable();
    }
  }

  onTemplateSelectionChange(event: any) {
    this.showApproverFields = true;
    const selectedTemplateId = event.value;

    this.expenseService.getAdvanceTemplateById(selectedTemplateId).subscribe((res: any) => {
      this.templateById = res.data;
      if (this.templateById.approvalType === 'template-wise') {
        if (this.templateById.approvalLevel === '1') {
          this.addTemplateAssignmentForm.patchValue({
            primaryApprover: this.templateById.firstApprovalEmployee,
            secondaryApprover: null
          });
          this.addTemplateAssignmentForm.get('primaryApprover').disable();
          this.addTemplateAssignmentForm.get('primaryApprover').updateValueAndValidity();
          this.addTemplateAssignmentForm.get('secondaryApprover').disable();
          this.addTemplateAssignmentForm.get('secondaryApprover').updateValueAndValidity();

          // Disable the fields
          this.primaryApproverField.nativeElement.disabled = true;
          this.secondaryApproverField.nativeElement.disabled = true;

        } else if (this.templateById.approvalLevel === '2') {
          this.addTemplateAssignmentForm.patchValue({
            primaryApprover: this.templateById.firstApprovalEmployee,
            secondaryApprover: this.templateById.secondApprovalEmployee
          });
          this.addTemplateAssignmentForm.get('primaryApprover').disable();
          this.addTemplateAssignmentForm.get('primaryApprover').updateValueAndValidity();
          this.addTemplateAssignmentForm.get('secondaryApprover').disable();
          this.addTemplateAssignmentForm.get('secondaryApprover').updateValueAndValidity();

          // Disable the fields
          this.primaryApproverField.nativeElement.disabled = true;
          this.secondaryApproverField.nativeElement.disabled = true;
        }
      } else if (this.templateById.approvalType === 'employee-wise') {
        if (this.templateById.approvalLevel === '1') {
          this.addTemplateAssignmentForm.patchValue({
            primaryApprover: this.templateById.firstApprovalEmployee,
            secondaryApprover: null
          });
          this.addTemplateAssignmentForm.get('primaryApprover').enable();
          this.addTemplateAssignmentForm.get('primaryApprover').updateValueAndValidity();
          this.addTemplateAssignmentForm.get('secondaryApprover').enable();
          this.addTemplateAssignmentForm.get('secondaryApprover').updateValueAndValidity();

          // Enable the fields
          this.primaryApproverField.nativeElement.disabled = false;
          this.secondaryApproverField.nativeElement.disabled = false;

        } else if (this.templateById.approvalLevel === '2') {
          this.addTemplateAssignmentForm.patchValue({
            primaryApprover: this.templateById.firstApprovalEmployee,
            secondaryApprover: this.templateById.secondApprovalEmployee
          });
          this.addTemplateAssignmentForm.get('primaryApprover').enable();
          this.addTemplateAssignmentForm.get('primaryApprover').updateValueAndValidity();
          this.addTemplateAssignmentForm.get('secondaryApprover').enable();
          this.addTemplateAssignmentForm.get('secondaryApprover').updateValueAndValidity();
          this.primaryApproverField.nativeElement.disabled = false;
          this.secondaryApproverField.nativeElement.disabled = false;
        }
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getAssignments();
  }

  getAssignments() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };

    this.expenseService.getAdvanceTemplateAssignment(pagination).subscribe((res: any) => {
      this.dataSource.data = res.data.map((report) => {
        const expenseAdvanceTemplateDetails = this.getTemplateDetails(report?.advanceTemplate);
        return {
          ...report,
          employeeName: this.getUser(report?.user),
          advanceTemplate: this.getAdvanceTemplate(report?.advanceTemplate),
          primaryApprover: this.getUser(report?.primaryApprover),
          effectiveDate: report.effectiveDate,
          approvalType: expenseAdvanceTemplateDetails?.approvalType
        };
      });
      this.totalRecords = res.total;
      const assignedUserIds = this.templateAssignments.map(assignment => assignment.user);
      this.availableAssignees = this.allAssignee.filter(user => !assignedUserIds.includes(user._id));

      this.dataSource.data = res.data.map((report) => {
        const expenseAdvanceTemplateDetails = this.getTemplateDetails(report?.advanceTemplate);
        return {
          ...report,
          employeeName: this.getUser(report?.user),
          advanceTemplate: this.getAdvanceTemplate(report?.advanceTemplate),
          primaryApprover: this.getUser(report?.primaryApprover),
          effectiveDate: report.effectiveDate,
          approvalType: expenseAdvanceTemplateDetails?.approvalType
        };
      });
      this.allData = this.dataSource.data;
    });
  }

  getTemplateDetails(templateId: string) {
    return this.advanceTemplates?.find(template => template?._id === templateId);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onSubmit() {
    this.isSubmitted = true; // Disable the button immediately

    // Enable form controls before submission
    this.addTemplateAssignmentForm.get('primaryApprover')?.enable();
    this.addTemplateAssignmentForm.get('secondaryApprover')?.enable();
    this.addTemplateAssignmentForm.get('advanceTemplate')?.enable();
    this.addTemplateAssignmentForm.get('effectiveDate')?.enable();
    this.addTemplateAssignmentForm.get('user')?.enable();

    // Validate the form

    if (this.addTemplateAssignmentForm.valid) {
      this.isSubmitted = true;
      // Prepare the payload
      let payload = {
        user: this.addTemplateAssignmentForm.value.user,
        primaryApprover: this.addTemplateAssignmentForm.value.primaryApprover || null,
        secondaryApprover: this.addTemplateAssignmentForm.value.secondaryApprover || null,
        advanceTemplate: this.addTemplateAssignmentForm.value.advanceTemplate,
        effectiveDate: this.addTemplateAssignmentForm.value.effectiveDate,
      };

      if (this.changeMode === 'Update') {
        this.expenseService.addAdvanceTemplateAssignment(payload).subscribe(
          (res: any) => {
            this.toast.success(this.translate.instant('expenses.template_assigned_update_success'));
            this.getAssignments();
            this.showApproverFields = false;
            this.changeMode = 'Add';
            this.isEdit = false;
            this.addTemplateAssignmentForm.enable();
            this.addTemplateAssignmentForm.reset();
            this.dialogRef.close();
          },
          (err) => {
            this.toast.error(err || this.translate.instant('expenses.template_assigned_update_error'));
          }
        );
      } else if (this.changeMode === 'Add') {
        this.expenseService.addAdvanceTemplateAssignment(payload).subscribe(
          (res: any) => {
            this.getAssignments();
            this.toast.success(this.translate.instant('expenses.template_assigned_success'));
            this.addTemplateAssignmentForm.reset();
            this.dialogRef.close();
          },
          (err) => {
            this.toast.error(err || this.translate.instant('expenses.template_assigned_error'));
          }
        );
      }

      // Disable form controls after submission (as per original logic)
      this.addTemplateAssignmentForm.get('primaryApprover')?.disable();
      this.addTemplateAssignmentForm.get('secondaryApprover')?.disable();
      this.addTemplateAssignmentForm.get('user')?.disable();
    }
    else {
      this.addTemplateAssignmentForm.markAllAsTouched();
    }

  }

  setFormValues() {
    this.showApproverFields = true;
    let payload = { skip: '', next: '' }
    const data = this.selectedTemplateAssignment;
    if (this.isEdit) {
      this.expenseService.getAdvanceTemplateAssignmentByUser(data.user, payload).subscribe((res: any) => {
        const templateAssignment = res.data[0];
        this.addTemplateAssignmentForm.patchValue({
          user: templateAssignment.user,
          primaryApprover: templateAssignment.primaryApprover,
          advanceTemplate: templateAssignment.advanceTemplate,
          effectiveDate: templateAssignment.effectiveDate,
        });
        this.expenseService.getAdvanceTemplateById(templateAssignment.advanceTemplate).subscribe((res: any) => {
          this.templateById = res.data;
          if (this.templateById.approvalType === 'template-wise') {

            this.addTemplateAssignmentForm.patchValue({
              primaryApprover: templateAssignment?.primaryApprover,
              secondaryApprover: null,
              user: templateAssignment.user,
              advanceTemplate: templateAssignment.advanceTemplate,
              effectiveDate: templateAssignment.effectiveDate
            });
            this.addTemplateAssignmentForm.get('user').disable();
            this.addTemplateAssignmentForm.get('primaryApprover').disable();
          }

          else if (this.templateById.approvalType === 'employee-wise') {
            this.addTemplateAssignmentForm.patchValue({
              primaryApprover: templateAssignment.primaryApprover,
              secondaryApprover: templateAssignment.secondaryApprover,
              user: templateAssignment.user,
              advanceTemplate: templateAssignment.advanceTemplate,
              effectiveDate: templateAssignment.effectiveDate
            });
            this.addTemplateAssignmentForm.get('user').disable();
            this.addTemplateAssignmentForm.get('primaryApprover').enable();
          }
        });
      });
    }
    if (!this.isEdit) {
      this.addTemplateAssignmentForm.reset();
    }
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.addTemplateAssignmentForm.reset();
  }

  deleteAdvanceTemplateAssignment(id, index: number) {
    this.expenseService.deleteAdvanceTemplateAssignment(id).subscribe((res: any) => {
      this.ngOnInit();
      this.toast.success(this.translate.instant('expenses.delete_success'));
    },
      (err) => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'));
      })
  }

  deleteDialog(id: string, index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAdvanceTemplateAssignment(id, index);
      }
      err => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'))
      }
    });
  }

  handleAction(event: any, addModal: any) {
    if (event.action.label === 'Edit') {
      this.changeMode = 'Update';
      this.isEdit = true;
      this.showApproverFields = true;
      this.selectedTemplateAssignment = event.row;
      this.setFormValues();
      this.open(addModal);
    }
    if (event.action.label === 'Delete') {
      const index = this.dataSource.data.findIndex(row => row._id === event.row._id);
      this.deleteDialog(event.row._id, index);
    }
  }

  onSortChange(event: any) {
    const sorted = this.dataSource.data.slice().sort((a, b) => {
      const key = event.active;
      const valueA = key === 'effectiveDate' ? new Date(a[key]) : a[key];
      const valueB = key === 'effectiveDate' ? new Date(b[key]) : b[key];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.dataSource.data = sorted;
  }

  onSearchChange(event: any) {
    this.dataSource.data = this.allData.filter(row => {
      const found = this.columns.some(col => {
        if (col.key === 'effectiveDate') {
          return row[col.key] ? new Date(row[col.key]).toLocaleDateString().toLowerCase().includes(event.toLowerCase()) : false;
        }
        return row[col.key]?.toString().toLowerCase().includes(event.toLowerCase());
      });
      return found;
    }) || [];
  }
}
