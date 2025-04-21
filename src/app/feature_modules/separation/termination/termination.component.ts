import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { CommonService } from 'src/app/_services/common.Service';
import { SeparationService } from 'src/app/_services/separation.service';

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
  displayedColumns: string[] = [
    'user',
    'termination_date', 'termination_reason', 'notice_given',
    'performance_warnings', 'severance_paid', 'final_pay_processed',
    'company_property_returned', 'exit_interview_date', 'legal_compliance',
    'unemployment_claim', 'termination_status', 'actions'
  ];
  userTerminationColumns: string[] = ['termination_date', 'termination_reason', 'notice_given',
    'performance_warnings', 'severance_paid', 'final_pay_processed',
    'company_property_returned', 'exit_interview_date', 'legal_compliance',
    'unemployment_claim', 'actions'];

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
                'Assets are still assigned. Please release them before marking company property as returned.',
                'Warning'
              );
              return;
            } else {
              this.saveTermination(); // If assets are fine, proceed
            }
          },
          (err) => {
            const errorMessage = err?.error?.message || err?.message || err 
          || 'Failed to verify assigned assets';
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
        this.toast.success('Termination Updated', 'Successfully');
        this.resetForm();
        this.closeDialog();
      });
    } else {
      this.separationService.addTermination(this.terminationForm.value).subscribe((res: any) => {
        this.getTerminations();
        this.toast.success('Termination Added', 'Successfully');
        this.resetForm();
        this.closeDialog();
      },
        err => {
          const errorMessage = err?.error?.message || err?.message || err 
          || 'Termination cannot be added.';
          this.toast.error(errorMessage, 'Error!');
        });
    }
  }
  
  updateTerminationStatus(id: string, status: string) {
    
  // If status is being changed to Completed, check the company_property_returned flag
  if (status === this.terminationStatuses.Completed && this.selectedRecord && !this.selectedRecord.company_property_returned) {
    this.toast.error('Cannot mark as Completed. Company property has not been returned.', 'Error');
    return;
  }

    const payload = { termination_status: status };
    this.separationService.updateTerminationStatus(id, payload).subscribe((res: any) => {
      this.getTerminations();
      this.closeDialog();
      this.toast.success('Status Updated Successfully', 'Termination');
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || 'Status Update Failed.';
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
          || 'Error fetching appeal.';
          this.toast.error(errorMessage, 'Error!');
      }
    });
    this.dialogRef = this.dialog.open(this.appealDialog, { disableClose: true });
  }
  
  submitAppeal(): void {
    const appealReason = this.appealForm.get('appeal_reason')?.value;
  
    if (!appealReason) {
      this.toast.error('Please enter an appeal reason', 'Error');
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
          this.toast.success('Appeal updated successfully', 'Success');
          this.dialogRef.close();
          this.getTerminations();
        },
        (err) => {
          this.toast.error(err.error.message || 'Failed to update appeal', 'Error');
        }
      );
    } else {
      // Submitting new appeal
      this.separationService.submitTerminationAppeal(payload).subscribe(
        (res: any) => {
          this.toast.success('Appeal submitted successfully', 'Success');
          this.dialogRef.close();
          this.getTerminations();
        },
        (err) => {
          const errorMessage = err?.error?.message || err?.message || err 
          || 'Failed to submit appeal.';
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
          || 'Error fetching appeal.';
          this.toast.error(errorMessage, 'Error!');
      }
    });
  }
  
  
  submitAppealReview(): void {
    const payload = this.reviewAppealForm.value;
    this.separationService.reviewTerminationAppeal(this.selectedAppeal._id, payload).subscribe(
      (res: any) => {
        this.toast.success('Appeal reviewed successfully', 'Success');
        this.dialogRef.close();
        this.getTerminations();
      },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || 'Review failed.';
        this.toast.error(errorMessage, 'Error!');
      }
    );
  }
    
}