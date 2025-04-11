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
interface ResignationStatus {
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
      this.loadNoticePeriod();
    });
  }

  openDialog(resignation?: any): void {
    this.isEditMode = !!resignation;
    if (this.isEditMode) {
      this.resignationForm.patchValue(resignation);
    } else {
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
  onCompanyPropertyReturnedChange() {    // If user tries to check the box
   
    this.assetManagementService.getEmployeeAssets(this.resignationForm.get('user')?.value).subscribe(
      response => {
        const assignedAssets = response.data;  
        if (assignedAssets && assignedAssets.length > 0) {
          this.toast.error('The asset is currently assigned. Please unassign it before confirming the return of company property.', 'Warning');    
          return;      
        }
      },
      error => {
        this.toast.error('Failed to verify assigned assets', 'Error');
        console.error(error);
      });   
}
  onSubmit(): void {
    this.resignationForm.patchValue({
      user: this.currentUser.id
    });
    if (this.resignationForm.get('company_property_returned')?.value === true) 
      {
        this.onCompanyPropertyReturnedChange();
      }
    if (this.resignationForm.valid) {
        if (this.isEditMode) {
         this.separationService.updateResignationById(  this.selectedRecord._id, this.resignationForm.value).subscribe((res: any) => {
         this.getResignationByUser();
         this.resignationForm.reset();
         this.toast.success('Resignation updated', 'Successfully');
        },
        err => { this.toast.error('Resignation cannot be updated', 'Error'); });
      
      } else {
        this.separationService.addResignation(this.resignationForm.value).subscribe((res: any) => {  
          this.getResignationByUser();     
         this.resignationForm.reset();
          this.toast.success('Resignation Added', 'Successfully');
        },
          err => { this.toast.error('Resignation cannot be added', 'Error'); });
      }
      this.dialogRef.close();
    }
  }
  private loadNoticePeriod(): void {
    if (this.currentUser?.id) {
      this.userService.getJobInformationByUserId(this.currentUser.id).subscribe({
        next: (res: any) => {
           if (res.data && res.data.length > 0) {
            this.resignationForm.patchValue({
              notice_period: res.data[0].notice_period || 'N/A'
            });
          }
        },
        error: (err) => {
          console.error('Error fetching job information:', err);
          this.resignationForm.patchValue({ notice_period: 'N/A' });
          this.toast.error('Failed to load notice period', 'Error');
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
    this.toast.error('Cannot mark as Completed. Company property has not been returned.', 'Error');
    return;
  }
    let payload = {
      resignation_status: status
    }
    console.log(payload)
    this.separationService.updateResignationStatus(resignation, payload).subscribe((res: any) => {
      this.getResignationByUser();
      this.closeDialog();
      this.toast.success('Status Updated Successfully', 'Resignation');
    },
    (err) => {
      this.toast.error('Status Update Failed', 'Error');
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
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

}
