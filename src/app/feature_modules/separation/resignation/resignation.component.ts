import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SeparationService } from 'src/app/_services/separation.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';

import { TranslateService } from '@ngx-translate/core';interface ResignationStatus {
  Pending: string,
  Completed: string,
  InProgress:string,
  Approved:string,    
  Deleted:string
}
@Component({
  selector: 'app-resignation',
  templateUrl: './resignation.component.html',
  styleUrls: ['./resignation.component.css']
})
export class ResignationComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @ViewChild('updateStatusResignation') updateStatusResignation: TemplateRef<any>;
  resignationForm: FormGroup;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'user', 'resignation_date', 'last_working_day', 'notice_period',
    'resignation_reason', 'exit_interview_date', 'handover_complete',
    'company_property_returned', 'final_pay_processed', 'exit_feedback',
    'resignation_status', 'actions'
  ];
  isEditMode = false;
  dialogRef: MatDialogRef<any>;
  view = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  resignationRecords: any[] = [];
  users: any[] = [];
  selectedRecord: any;
  allResignations: any[] =[];
  selectedStatus: string;
  changedStatus: string;
  resignationStatuses: ResignationStatus;
  constructor(private fb: FormBuilder,
    private dialog: MatDialog,
    private separationService: SeparationService,
    private toast: ToastrService,
    private userService: UserService,
     private assetManagementService: AssetManagementService,
     private translate: TranslateService,
    private commonService: CommonService) {
    this.resignationForm = this.fb.group({
      user: [''],
      resignation_date: [''],
      last_working_day: [''],
      notice_period: [{ value: '', disabled: true }],
      resignation_reason: [''],
      exit_interview_date: [''],
      handover_complete: [false],
      company_property_returned: [false],
      final_pay_processed: [false],
      exit_feedback: ['']
    });
  }

  ngOnInit(): void {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data['data'];      
      this.getallResignationStatusList();
      this.getResignationByUser();
    });
  }

  openDialog(resignation?: any): void { 
    this.isEditMode = !!resignation;
    if (this.isEditMode) {
      this.resignationForm.patchValue(resignation);
    } else {
      this.loadNoticePeriod();
      this.resignationForm.reset();
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

  closeDialog(): void {
    this.dialogRef.close();
  }

  resetForm(): void {
    this.resignationForm.reset();
  }

  onSubmit(): void {
    this.resignationForm.get('notice_period')?.enable();
    this.resignationForm.patchValue({
      user: this.currentUser.id
    });

    const companyPropertyReturned = this.resignationForm.get('company_property_returned')?.value;
    const userId = this.currentUser.id;

    if (companyPropertyReturned) {
      this.assetManagementService.getEmployeeAssets(userId).subscribe(
        (response) => {
          const assignedAssets = response?.data ?? [];

          if (assignedAssets.length > 0) {
            this.toast.error(
              this.translate.instant('separation.assest_return_warning'),
              this.translate.instant('common.warning')
            );
            return;
          } else {
            this.saveResignation(); // Proceed if no assets assigned
          }
        },
        (err) => {         
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('separation.assest_verify_failed')
          ;
          this.toast.error(errorMessage, 'Error!');
        }
      );
    } else {
      this.saveResignation(); // Skip asset check if not marked as returned
    }
    this.resignationForm.get('notice_period')?.disable();
  }
  saveResignation() {
    if (this.resignationForm.valid) {
      if (this.isEditMode) {
        this.separationService.updateResignationById(this.selectedRecord._id, this.resignationForm.value).subscribe(
          (res: any) => {
            this.getResignationByUser();
            this.resignationForm.reset();
            this.toast.success( this.translate.instant('separation.update_success'),  this.translate.instant('separation.success'));
            this.dialogRef.close();
          },
          err => {
            const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('separation.update_fail');
          this.toast.error(errorMessage, 'Error!');
          }
        );
      } else {
        this.separationService.addResignation(this.resignationForm.value).subscribe(
          (res: any) => {
            this.getResignationByUser();
            this.resignationForm.reset();
            this.toast.success(this.translate.instant('separation.add_success'), this.translate.instant('separation.success'));
            this.dialogRef.close();
          },
          err => {
            const errorMessage = err?.error?.message || err?.message || err 
            ||this.translate.instant('separation.add_fail');;
            this.toast.error(errorMessage, 'Error!');
          }
        );
      }
    }
  }

  private loadNoticePeriod(): void {
    if (this.currentUser?.id) {
      this.userService.getJobInformationByUserId(this.currentUser.id).subscribe({
        next: (res: any) => {
           if (res.data && res.data.length > 0) {
            this.resignationForm.patchValue({
              notice_period: res.data[0].noticePeriod || 'N/A'
            });
           }
          else{
            this.toast.error(
              this.translate.instant('separation.notice_period_fetch_fail'),
              this.translate.instant('common.error')
            );    this.dialogRef.close();
          }
        },
        error: (err) => {          
          this.resignationForm.patchValue({ notice_period: 'N/A' });
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('separation.notice_period_load_fail');
          this.toast.error(errorMessage, 'Error!');
        }
      });
    }
  }
  getResignationByUser() {
    if (this.view === 'admin'){
      this.separationService.getResignationsByCompany().subscribe((res: any)=>{
        this.allResignations = res.data;
      })
    }
    if (this.view === 'user') {
      this.separationService.getResignationsByUserId(this.currentUser.id).subscribe((res: any) => {
        this.resignationRecords=res.data;
        // this.dataSource.data = this.resignationRecords;
      });
    }    
  }
  getallResignationStatusList() {
    this.separationService.getResignationStatusList().subscribe((res: any) => {
      this.resignationStatuses = res.data.statusList;      
    })
  }
  getMatchingUser(userId: string) {
    const matchingUser = this.users.find(user => user.id === userId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Removed';
  }

  updateResignationStatus(resignation: string, status: string) {
    // If status is being changed to Completed, check the company_property_returned flag
  if (status === this.resignationStatuses.Completed && this.selectedRecord && !this.selectedRecord.company_property_returned) {
    this.toast.error(
      this.translate.instant('separation.company_property_not_returned'),
      this.translate.instant('common.error')
    );
      return;
  }
    let payload = {
      resignation_status: status
    }
    this.separationService.updateResignationStatus(resignation, payload).subscribe((res: any) => {
      this.getResignationByUser();
      this.closeDialog();
      this.toast.success(
        this.translate.instant('separation.status_update_success')
      );
      
    },
    (err) => {
      const errorMessage = err?.error?.message || err?.message || err 
      || this.translate.instant('separation.status_update_fail');
      this.toast.error(errorMessage, 'Error!');
    });
  } 

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.selectedRecord.resignation_status == this.resignationStatuses.Pending
        {
          this.updateResignationStatus(id,this.resignationStatuses.Deleted);
        }
      }
      err => {
        const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('separation.cannot_be_deleted');
          this.toast.error(errorMessage, 'Error!');
      }
    });
  }

}
