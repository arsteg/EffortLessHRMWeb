import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-advance-template-assignment',
  templateUrl: './advance-template-assignment.component.html',
  styleUrl: './advance-template-assignment.component.css'
})

export class AdvanceTemplateAssignmentComponent {
  searchText: '';
  isEdit = false;
  changeMode: 'Add' | 'View' | 'Update' = 'Add';
  addTemplateAssignmentForm: FormGroup;
  closeResult: string = '';
  advanceTemplates: any;
  templateAssignments: any;
  templateResponse;
  allAssignee: any[];
  selectedTemplateAssignment: any;
  p: number = 1;
  public sortOrder: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  showApproverFields = true;
  templateById: any;
  @ViewChild('primaryApproverField') primaryApproverField: ElementRef;
  @ViewChild('secondaryApproverField') secondaryApproverField: ElementRef;
  displayedColumns: string[] = ['employeeName', 'advanceTemplate', 'primaryApprover', 'secondaryApprover', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  dialogRef: MatDialogRef<any>;
  constructor(private fb: FormBuilder,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private toast: ToastrService,
    private dialog: MatDialog,
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
      this.dataSource.data = assignments.data.map((report) => {
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
      this.totalRecords = assignments?.total || 0;
    });
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
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });
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
          secondaryApprover: this.getUser(report?.secondaryApprover),
          approvalType: expenseAdvanceTemplateDetails?.approvalType
        };
      });
      this.totalRecords = res.total;
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
    this.addTemplateAssignmentForm.get('primaryApprover')?.enable();
    this.addTemplateAssignmentForm.get('secondaryApprover')?.enable();
    this.addTemplateAssignmentForm.get('advanceTemplate')?.enable();
    this.addTemplateAssignmentForm.get('effectiveDate')?.enable();
    this.addTemplateAssignmentForm.get('user')?.enable();

    let payload = {
      user: this.addTemplateAssignmentForm.value.user,
      primaryApprover: this.addTemplateAssignmentForm.value.primaryApprover || null,
      secondaryApprover: this.addTemplateAssignmentForm.value.secondaryApprover || null,
      advanceTemplate: this.addTemplateAssignmentForm.value.advanceTemplate,
      effectiveDate: this.addTemplateAssignmentForm.value.effectiveDate,
    };

    if (this.changeMode === 'Update') {
      this.expenseService.addAdvanceTemplateAssignment(payload).subscribe((res: any) => {
        this.toast.success('Advance Template Assignment Updated', 'Successfully')
        this.getAssignments();
        this.showApproverFields = false;
        this.changeMode = 'Add';
        this.isEdit = false;
        this.addTemplateAssignmentForm.enable();
        this.addTemplateAssignmentForm.reset();
      },
        (err) => {
          this.toast.error('Advance Template Assignment Cannot be Updated!', 'Error')
        });
    }
    if (this.changeMode === 'Add') {
      this.expenseService.addAdvanceTemplateAssignment(payload).subscribe((res: any) => {
        const newTemplateAssignment = res.data;
        this.templateAssignments.push(newTemplateAssignment);
        this.toast.success('Advance Template Assigned!', 'Successfully')
        this.addTemplateAssignmentForm.reset();
      },
        (err) => {
          this.toast.error('Advance Template Cannot be Created!', 'Error')
        });
    }
    this.addTemplateAssignmentForm.get('primaryApprover')?.disable();
    this.addTemplateAssignmentForm.get('secondaryApprover')?.disable();
    this.addTemplateAssignmentForm.get('advanceTemplate')?.disable();
    this.addTemplateAssignmentForm.get('effectiveDate')?.disable();
    this.addTemplateAssignmentForm.get('user')?.disable();
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
          secondaryApprover: templateAssignment.secondaryApprover
        });
        this.expenseService.getAdvanceTemplateById(templateAssignment.advanceTemplate).subscribe((res: any) => {
          this.templateById = res.data;
          if (this.templateById.approvalType === 'template-wise') {
            if (this.templateById.approvalLevel === '1') {
              this.addTemplateAssignmentForm.patchValue({
                primaryApprover: templateAssignment?.primaryApprover,
                secondaryApprover: null,
                user: templateAssignment.user,
                advanceTemplate: templateAssignment.advanceTemplate,
                effectiveDate: templateAssignment.effectiveDate
              });
              this.addTemplateAssignmentForm.get('user').disable();
              this.addTemplateAssignmentForm.get('effectiveDate').disable();
              this.addTemplateAssignmentForm.get('advanceTemplate').disable();
              this.addTemplateAssignmentForm.get('primaryApprover').disable();
            } else if (this.templateById.approvalLevel === '2') {
              this.addTemplateAssignmentForm.patchValue({
                primaryApprover: templateAssignment.primaryApprover,
                secondaryApprover: templateAssignment.secondaryApprover,
                user: templateAssignment.user,
                advanceTemplate: templateAssignment.advanceTemplate,
                effectiveDate: templateAssignment.effectiveDate
              });
            }
            this.addTemplateAssignmentForm.get('user').disable();
            this.addTemplateAssignmentForm.get('effectiveDate').disable();
            this.addTemplateAssignmentForm.get('advanceTemplate').disable();
            this.addTemplateAssignmentForm.get('primaryApprover').disable();
            this.addTemplateAssignmentForm.get('secondaryApprover').disable();
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
            this.addTemplateAssignmentForm.get('effectiveDate').disable();
            this.addTemplateAssignmentForm.get('advanceTemplate').disable();
            this.addTemplateAssignmentForm.get('primaryApprover').enable();
            this.addTemplateAssignmentForm.get('secondaryApprover').enable();
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
    let _id = id._id;
    this.expenseService.deleteAdvanceTemplateAssignment(_id).subscribe((res: any) => {
      this.templateAssignments.splice(index)
      this.toast.success('Successfully Deleted!!!', 'Advance Template Assgnment')
    },
      (err) => {
        this.toast.error('Can not be deleted!')
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
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
}
