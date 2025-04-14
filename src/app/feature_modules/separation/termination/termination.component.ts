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
  selectedRecord: any;
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
    'unemployment_claim'];

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @ViewChild('updateStatusResignation') updateStatusResignation: TemplateRef<any>;
  selectedStatus: string;
  changedStatus: string;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

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
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data['data'];
    }); 
    this.getallTerminationStatusList();
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
          (error) => {
            console.error('Asset Fetch Error:', error);
            this.toast.error('Failed to verify assigned assets', 'Error');
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
          this.toast.error('Termination cannot be added', 'Error');
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
        this.toast.error('Status Update Failed', 'Error');
      });
  }
}