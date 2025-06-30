import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { CommonService } from 'src/app/_services/common.Service';
import { SeparationService } from 'src/app/_services/separation.service';
import { ActionVisibility } from 'src/app/models/table-column';

interface TerminationStatus {
  Appealed: string;
  Pending: string;
  Completed: string;
  Deleted: string;
  Reinstated: string
}
interface TerminationAppealStatus {
  Pending: string;
  Approved: string;
  Rejected: string;
}
@Component({
  selector: 'app-termination',
  templateUrl: './termination.component.html',
  styleUrls: ['./termination.component.css']
})

export class TerminationComponent {

  view = localStorage.getItem('adminView');
  isEditMode: boolean = false;
  dialogRef: MatDialogRef<any>;
  terminationForm: FormGroup;
  users: any[] = [];
  terminations: any[] = [];
  userTerminations:  any[] = [];
  terminationStatuses: TerminationStatus;    
  terminationAppealStatuses: TerminationAppealStatus;  
  
  selectedRecord: any;
  appealForm: FormGroup;
  reviewAppealForm: FormGroup;
  selectedAppeal: any;
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  // displayedColumns: string[] = [
  //   'user',
  //   'termination_date', 'termination_reason', 'notice_given',
  //   'performance_warnings', 'severance_paid', 'final_pay_processed',
  //   'company_property_returned', 'exit_interview_date', 'legal_compliance',
  //   'unemployment_claim', 'termination_status', 'actions'
  // ];
  // userTerminationColumns: string[] = ['termination_date', 'termination_reason', 'notice_given',
  //   'performance_warnings', 'severance_paid', 'final_pay_processed',
  //   'company_property_returned', 'exit_interview_date', 'legal_compliance',
  //   'unemployment_claim', 'actions'];
  adminColumns = [
    {
      key: 'user',
      name: 'User',
      valueFn: (row: any) => this.getMatchingUser(row?.user),
    },
    {
      key: 'termination_date',
      name: 'Termination Date',
      valueFn: (row: any) => new Date(row.termination_date).toLocaleDateString('en-US'),
    },
    {
      key: 'termination_reason',
      name: 'Termination Reason',
      valueFn: (row: any) => row.termination_reason,
    },
    {
      key: 'notice_given',
      name: 'Notice Given',
      valueFn: (row: any) => (row.notice_given ? 'Yes' : 'No'),
    },
    {
      key: 'performance_warnings',
      name: 'Performance Warnings',
      valueFn: (row: any) => row.performance_warnings,
    },
    {
      key: 'severance_paid',
      name: 'Severance Paid',
      valueFn: (row: any) => (row.severance_paid ? 'Yes' : 'No'),
    },
    {
      key: 'final_pay_processed',
      name: 'Final Pay Processed',
      valueFn: (row: any) => (row.final_pay_processed ? 'Yes' : 'No'),
      },
    {
      key: 'company_property_returned',
      name: 'Company Property Returned',
      valueFn: (row: any) => (row.company_property_returned ? 'Yes' : 'No'),
    },
    {
      key: 'exit_interview_date',
      name: 'Exit Interview Date',
      valueFn: (row: any) => (row.exit_interview_date ? new Date(row.exit_interview_date).toLocaleDateString('en-US') : ''),
    },
    {
      key: 'legal_compliance',
      name: 'Legal Compliance',
      valueFn: (row: any) => (row.legal_compliance ? 'Yes' : 'No'),
    },
    {
      key: 'unemployment_claim',
      name: 'Unemployment Claim',
      valueFn: (row: any) => (row.unemployment_claim ? 'Yes' : 'No'),
    },
    {
      key: 'termination_status',
      name: 'Termination Status',
      valueFn: (row: any) => row.termination_status,
    },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        {
          label: 'Complete',
          visibility: ActionVisibility.LABEL,
          icon: 'check_circle',
          hideCondition: (row: any) =>
            row.termination_status === this.terminationStatuses.Completed ||
            row.termination_status === this.terminationStatuses.Reinstated,
        },
        {
          label: 'Review Appeal',
          visibility: ActionVisibility.LABEL,
          icon: 'rate_review',
          hideCondition: (row: any) =>
            !(
              row.termination_status === this.terminationStatuses.Completed ||
              row.termination_status === this.terminationStatuses.Reinstated ||
              row.termination_status === this.terminationStatuses.Appealed
            ),
        },
        {
          label: 'Edit',
          visibility: ActionVisibility.LABEL,
          icon: 'edit',
          hideCondition: (row: any) =>
            row.termination_status === this.terminationStatuses.Completed ||
            row.termination_status === this.terminationStatuses.Reinstated,
        },
        {
          label: 'Delete',
          visibility: ActionVisibility.LABEL,
          icon: 'delete',
          hideCondition: (row: any) =>
            row.termination_status !== this.terminationStatuses.Completed ||
            row.termination_status !== this.terminationStatuses.Reinstated,
        },
      ],
    },
  ];

  userColumns = [
    {
      key: 'user',
      name: 'User',
      valueFn: (row: any) => this.getMatchingUser(row?.user),
    },
    {
      key: 'termination_date',
      name: 'Termination Date',
      valueFn: (row: any) => new Date(row.termination_date).toLocaleDateString('en-US'),
    },
    {
      key: 'termination_reason',
      name: 'Termination Reason',
      valueFn: (row: any) => row.termination_reason,
    },
    {
      key: 'notice_given',
      name: 'Notice Given',
      valueFn: (row: any) => (row.notice_given ? 'Yes' : 'No'),
    },
    {
      key: 'performance_warnings',
      name: 'Performance Warnings',
      valueFn: (row: any) => row.performance_warnings,
    },
    {
      key: 'severance_paid',
      name: 'Severance Paid',
      valueFn: (row: any) => (row.severance_paid ? 'Yes' : 'No'),
    },
    {
      key: 'final_pay_processed',
      name: 'Final Pay Processed',
      valueFn: (row: any) => (row.final_pay_processed ? 'Yes' : 'No'),
    },
    {
      key: 'company_property_returned',
      name: 'Company Property Returned',
      valueFn: (row: any) => (row.company_property_returned ? 'Yes' : 'No'),
    },
    {
      key: 'exit_interview_date',
      name: 'Exit Interview Date',
      valueFn: (row: any) => (row.exit_interview_date ? new Date(row.exit_interview_date).toLocaleDateString('en-US') : ''),
    },
    {
      key: 'legal_compliance',
      name: 'Legal Compliance',
      valueFn: (row: any) => (row.legal_compliance ? 'Yes' : 'No'),
    },
    {
      key: 'unemployment_claim',
      name: 'Unemployment Claim',
      valueFn: (row: any) => (row.unemployment_claim ? 'Yes' : 'No'),
    },
    {
      key: 'termination_status',
      name: 'Termination Status',
      valueFn: (row: any) => row.termination_status,
    },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        {
          label: 'Appeal',
          visibility: ActionVisibility.LABEL,
          icon: 'gavel'
        },
      ],
    },
  ];

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @ViewChild('updateStatusResignation') updateStatusResignation: TemplateRef<any>;
  @ViewChild('appealDialog') appealDialog: TemplateRef<any>;
  @ViewChild('reviewAppealDialog') reviewAppealDialog: TemplateRef<any>;

  selectedStatus: string;
  changedStatus: string;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  appealStatusKeys: any;

  constructor(private separationService: SeparationService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private commonService: CommonService,
    private assetManagementService: AssetManagementService,
    private translate: TranslateService,
    private toast: ToastrService) {
    this.terminationForm = this.fb.group({
      user: [''],
      termination_date: [''],
      termination_reason: [''],
      notice_given: [true],
      performance_warnings: [0],
      severance_paid: [true],
      final_pay_processed: [true],
      company_property_returned: [true],
      exit_interview_date: [''],
      legal_compliance: [true],
      unemployment_claim: [true]
    });
    this.appealForm = this.fb.group({
      appeal_reason: ['']
    });
    
    this.reviewAppealForm = this.fb.group({
      appeal_status: [''],
      decision_notes: ['']
    });
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data['data'];
    }); 
    this.getallTerminationStatusList();
    this.getallTerminationAppealStatusList();
    this.getTerminations();
  }

  openDialog(termination?: any): void {
    this.isEditMode = !!termination;
    if (this.isEditMode) {
      this.terminationForm.patchValue(termination);
    } else {
      this.terminationForm.reset();
    }
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      disableClose: true
    });
  }

  openUpdateStatusDialog(): void {
    this.dialogRef = this.dialog.open(this.updateStatusResignation, {
      disableClose: true
    });
  }

  resetForm(): void {
    this.terminationForm.reset();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  getallTerminationStatusList() {
    this.separationService.getTerminationStatusList().subscribe((res: any) => {
    this.terminationStatuses = res.data.statusList;       
    })
  }
  getallTerminationAppealStatusList() {
    this.separationService.getTerminationAppealStatusList().subscribe((res: any) => {
    this.terminationAppealStatuses = res.data.appealStatusList;       
    this.appealStatusKeys = Object.keys(this.terminationAppealStatuses); // Moved here
    })
  }
  getTerminations() {
    if (this.view === 'admin') {
      this.separationService.getTerminationByCompany().subscribe((res: any) => {
        this.terminations = res.data;
      });
    }
    if (this.view === 'user') {
      this.separationService.getTerminationByUserId(this.currentUser.id).subscribe((res: any) => {
        this.userTerminations = res.data;
      });
    }
  }

  getMatchingUser(userId: string) {
    const matchingUser = this.users.find(user => user.id === userId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Removed';
  }
    
  onSubmit() {
    if (this.terminationForm.valid) {
      const companyPropertyReturned = this.terminationForm.get('company_property_returned')?.value;
      const userId = this.terminationForm.get('user')?.value;
  
      if (companyPropertyReturned) {
        this.assetManagementService.getEmployeeAssets(userId).subscribe(
          (response) => {
            const assignedAssets = response?.data ?? [];  
            if (assignedAssets.length > 0) {
              this.toast.error(
                this.translate.instant('separation.assest_return_warning'),
                this.translate.instant('Error!')
              );
              return;
            } else {
              this.saveTermination(); // If assets are fine, proceed
            }
          },
          (err) => {
            const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('separation.add_fail');
          this.toast.error(errorMessage, 'Error!');
          }
        );
      } else {
        this.saveTermination(); // If company_property_returned is not checked, no need to validate
      }
    }
  }
  saveTermination() {
    if (this.isEditMode) {
      this.separationService.updateTerminationById(this.selectedRecord._id, this.terminationForm.value).subscribe((res: any) => {
        this.getTerminations();
        this.toast.success(this.translate.instant('separation.termination_update_success'), this.translate.instant('Successfully'));
        this.resetForm();
        this.closeDialog();
      });
    } else {
      this.separationService.addTermination(this.terminationForm.value).subscribe((res: any) => {
        this.getTerminations();
        this.toast.success(this.translate.instant('separation.termination_add_success'), this.translate.instant('Successfully'));

        this.resetForm();
        this.closeDialog();
      },
        err => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('separation.termination_add_fail')
          ;
          this.toast.error(errorMessage, 'Error!');
        });
    }
  }
  
  updateTerminationStatus(id: string, status: string) {
    status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  // If status is being changed to Completed, check the company_property_returned flag
  if (status === this.terminationStatuses.Completed && this.selectedRecord && !this.selectedRecord.company_property_returned) {
    this.toast.error(
      this.translate.instant('separation.company_property_not_returned'),
      this.translate.instant('Error!')
    );
       return;
  }

    const payload = { termination_status: status };
    this.separationService.updateTerminationStatus(id, payload).subscribe((res: any) => {
      this.getTerminations();
      this.closeDialog();
      this.toast.success(
        this.translate.instant('separation.status_update_success'),
        this.translate.instant('Status')
      );
      
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('separation.status_update_fail')
        this.toast.error(errorMessage, 'Error!');
      });
  }

  openAppealDialog(record: any): void {
    this.selectedRecord = record;
    this.separationService.getTerminationAppealByTerminationId(this.selectedRecord._id).subscribe({
      next: (appeal: any) => {
        this.appealForm.patchValue({
          appeal_reason: appeal.data.appeal_reason        
        });
        this.selectedAppeal = appeal.data;
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('separation.appeal_request');
          this.toast.error(errorMessage, 'Error!');
      }
    });
    this.dialogRef = this.dialog.open(this.appealDialog, { disableClose: true });
  }
  
  submitAppeal(): void {
    const appealReason = this.appealForm.get('appeal_reason')?.value;
  
    if (!appealReason) {
      this.toast.error(
        this.translate.instant('separation.appeal_reason_required'), 
        this.translate.instant('Error')
      );
           return;
    }
  
    const payload = {
      user: this.currentUser.id,
      termination: this.selectedRecord._id,
      appeal_reason: appealReason
    };
  
    // Check if we're updating an existing appeal
    if (this.selectedAppeal?._id) {
      this.separationService.reviewTerminationAppeal(this.selectedAppeal._id, payload).subscribe(
        (res: any) => {
          this.toast.success(
            this.translate.instant('separation.appeal_updated_success'), 
            this.translate.instant('Success')
          );
          
          this.dialogRef.close();
          this.getTerminations();
        },
        (err) => {
          this.toast.error(
            err?.error?.message || this.translate.instant('separation.appeal_update_fail'), 
            this.translate.instant('Error')
          );
          
        }
      );
    } else {
      // Submitting new appeal
      this.separationService.submitTerminationAppeal(payload).subscribe(
        (res: any) => {
          this.toast.success(
            this.translate.instant('separation.appeal_submitted_success'), 
            this.translate.instant('Success')
          );
          
          this.dialogRef.close();
          this.getTerminations();
        },
        (err) => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.toast.error(
            err?.error?.message || this.translate.instant('separation.appeal_submit_fail'), 
            this.translate.instant('Error')
          );
          ;
          this.toast.error(errorMessage, 'Error!');
        }
      );
    }
  }
  
  openReviewDialog(termination: any): void {  
  
    this.separationService.getTerminationAppealByTerminationId(termination).subscribe({
      next: (appeal: any) => {
        this.reviewAppealForm.patchValue({
          appeal_status: appeal.data.appeal_status,
          decision_notes: appeal.data.decision_notes,
          appeal_reason: appeal.data.appeal_reason
        });
        this.selectedAppeal = appeal.data;
        this.dialogRef = this.dialog.open(this.reviewAppealDialog, { disableClose: true });
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
          ||this.translate.instant('separation.fetch_appeal_fail');
          this.toast.error(errorMessage, 'Error!');
      }
    });
  }
  
  
  submitAppealReview(): void {
    const payload = this.reviewAppealForm.value;
    this.separationService.reviewTerminationAppeal(this.selectedAppeal._id, payload).subscribe(
      (res: any) => {
        this.toast.success(this.translate.instant('separation.appeal_review_success'), this.translate.instant('Success'));

        this.dialogRef.close();
        this.getTerminations();
      },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('separation.update_fail');
        this.toast.error(errorMessage, 'Error!');
      }
    );
  }
    
  onActionClick(event: any) {
    const { action, row } = event;
    this.selectedRecord = row;
    if (action.label === 'Edit') {
      this.isEditMode = true;
      this.openDialog(row);
    } else if (action.label === 'Delete') {
      this.updateTerminationStatus(row._id, this.terminationStatuses.Deleted);
    } else if (action.label === 'Complete') {
      this.selectedStatus = row._id;
      this.changedStatus = this.terminationStatuses.Completed;
      this.openUpdateStatusDialog();
    } else if (action.label === 'Review Appeal') {
      this.openReviewDialog(row._id);
    } else if (action.label === 'Appeal') {
      this.openAppealDialog(row);
    }
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getTerminations();
  }

  onSearchChange(searchText: string) {
    this.currentPage = 1;
    this.getTerminations();
  }

}