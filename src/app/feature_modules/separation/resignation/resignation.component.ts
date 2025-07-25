import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SeparationService } from 'src/app/_services/separation.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';

import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility } from 'src/app/models/table-column';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
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
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  minDate: Date;
  isSubmitting: boolean = false;
  isAdminView = false;
  columns = [
    {
      key: 'user',
      name: 'User',
      valueFn: (row: any) => this.getMatchingUser(row?.user)
    },
    {
      key: 'resignation_date',
      name: 'Resignation Date',
      valueFn: (row: any) => new Date(row.resignation_date).toLocaleDateString('en-US')
    },
    {
      key: 'last_working_day',
      name: 'Last Working Day',
      valueFn: (row: any) => new Date(row.last_working_day).toLocaleDateString('en-US')
    },
    {
      key: 'notice_period',
      name: 'Notice Period',
      valueFn: (row: any) => row.notice_period
    },
    {
      key: 'resignation_reason',
      name: 'Resignation Reason',
      valueFn: (row: any) => row.resignation_reason
    },
    {
      key: 'exit_interview_date',
      name: 'Exit Interview Date',
      valueFn: (row: any) => row.exit_interview_date ? new Date(row.exit_interview_date).toLocaleDateString('en-US') : ''
    },
    {
      key: 'handover_complete',
      name: 'Handover Complete',
      valueFn: (row: any) => row.handover_complete ? 'Yes' : 'No'
    },
    {
      key: 'company_property_returned',
      name: 'Company Property Returned',
      valueFn: (row: any) => row.company_property_returned ? 'Yes' : 'No'
    },
    {
      key: 'final_pay_processed',
      name: 'Final Pay Processed',
      valueFn: (row: any) => row.final_pay_processed ? 'Yes' : 'No'
    },
    {
      key: 'exit_feedback',
      name: 'Exit Feedback',
      valueFn: (row: any) => row.exit_feedback || ''
    },
    {
      key: 'resignation_status',
      name: 'Resignation Status',
      valueFn: (row: any) => row.resignation_status
    },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        {
          label: 'Edit',
          visibility: ActionVisibility.LABEL,
          icon: 'edit',
          hideCondition: (row: any) => row.resignation_status != this.resignationStatuses.Pending
        },
        {
          label: 'Delete',
          visibility: ActionVisibility.LABEL,
          icon: 'delete',
          hideCondition: (row: any) => row.resignation_status != this.resignationStatuses.Pending
        }
      ]
    }
  ];

  adminColumns = [
    {
      key: 'user',
      name: 'User',
      valueFn: (row: any) => this.getMatchingUser(row?.user)
    },
    {
      key: 'resignation_date',
      name: 'Resignation Date',
      valueFn: (row: any) => new Date(row.resignation_date).toLocaleDateString('en-US')
    },
    {
      key: 'last_working_day',
      name: 'Last Working Day',
      valueFn: (row: any) => new Date(row.last_working_day).toLocaleDateString('en-US')
    },
    {
      key: 'notice_period',
      name: 'Notice Period',
      valueFn: (row: any) => row.notice_period
    },
    {
      key: 'resignation_reason',
      name: 'Resignation Reason',
      valueFn: (row: any) => row.resignation_reason
    },
    {
      key: 'exit_interview_date',
      name: 'Exit Interview Date',
      valueFn: (row: any) => row.exit_interview_date ? new Date(row.exit_interview_date).toLocaleDateString('en-US') : ''
    },
    {
      key: 'handover_complete',
      name: 'Handover Complete',
      valueFn: (row: any) => row.handover_complete ? 'Yes' : 'No'
    },
    {
      key: 'company_property_returned',
      name: 'Company Property Returned',
      valueFn: (row: any) => row.company_property_returned ? 'Yes' : 'No'
    },
    {
      key: 'final_pay_processed',
      name: 'Final Pay Processed',
      valueFn: (row: any) => row.final_pay_processed ? 'Yes' : 'No'
    },
    {
      key: 'exit_feedback',
      name: 'Exit Feedback',
      valueFn: (row: any) => row.exit_feedback || ''
    },
    {
      key: 'resignation_status',
      name: 'Resignation Status',
      valueFn: (row: any) => row.resignation_status
    },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        {
          label: 'Edit',
          visibility: ActionVisibility.LABEL,
          icon: 'edit',
          hideCondition: (row: any) => row.resignation_status != this.resignationStatuses.Pending
        },
        {
          label: 'Pending',
          visibility: ActionVisibility.LABEL,
          icon: 'check_circle',
          hideCondition: (row: any) => (row.resignation_status === this.resignationStatuses.Pending)
        },
        {
          label: 'In-Progress',
          visibility: ActionVisibility.LABEL,
          icon: 'hourglass_empty',
          hideCondition: (row: any) => (row.resignation_status === this.resignationStatuses.InProgress)
        },
        {
          label: 'Approved',
          visibility: ActionVisibility.LABEL,
          icon: 'done',
          hideCondition: (row: any) => (row.resignation_status === this.resignationStatuses.Approved)
        }
      ]
    }
  ];
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
        resignation_date: ['', Validators.required],
        last_working_day: ['', Validators.required],
        notice_period: ['', Validators.required],
        resignation_reason: ['', Validators.required],
        exit_interview_date: [''],
        handover_complete: [false],
        company_property_returned: [false],
        final_pay_processed: [false],
        exit_feedback: ['']
      }, { validators: CustomValidators.exitInterviewAfterTerminationValidator() });
      
   
  }

  ngOnInit(): void {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data['data'];      
      this.getallResignationStatusList();
      this.getResignationByUser();
      this.resignationForm.get('resignation_date')?.valueChanges.subscribe((resignationDate: Date) => {
        const noticePeriod = +this.resignationForm.get('notice_period')?.value;
      
        if (resignationDate && noticePeriod && !isNaN(noticePeriod)) {
          const lastWorkingDay = new Date(resignationDate);
          lastWorkingDay.setDate(lastWorkingDay.getDate() + noticePeriod);
      
          this.resignationForm.patchValue({
            last_working_day: lastWorkingDay
          });
        }
      });
      
    });
    this.isAdminView = localStorage.getItem('adminView') == 'admin';    
  }

  openDialog(resignation?: any): void { 
    this.isSubmitting = false;
    this.isEditMode = !!resignation;
    const today = new Date();
    this.minDate = new Date(today.setDate(today.getDate()));
    if (this.isEditMode) {
      this.resignationForm.patchValue(resignation);
    } else {
      this.loadNoticePeriod();
      this.resignationForm.reset();
    }
    
    if (this.isAdminView) {
      this.resignationForm.get('resignation_date')?.disable();
      this.resignationForm.get('resignation_reason')?.disable();
    } else {
      this.resignationForm.get('exit_feedback')?.disable();
    }
    this.resignationForm.get('notice_period')?.disable();
    this.resignationForm.get('last_working_day')?.disable();
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      disableClose: true,
      width: "50%"
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
    this.isSubmitting = true;
    this.resignationForm.markAllAsTouched();
    this.resignationForm.updateValueAndValidity();
    this.resignationForm.get('notice_period')?.enable();
    this.resignationForm.get('last_working_day')?.enable();

    if (this.isEditMode) {
      console.log(this.selectedRecord.user);
      this.resignationForm.patchValue({
        user: this.resignationForm.get('user')?.value
      });
    }
    else
    {
      this.resignationForm.patchValue({
        user: this.currentUser.id
      });
    }
    if (this.resignationForm.invalid) {
      this.toast.error('Please fill all required fields', 'Error!');
      return;
    }
    const companyPropertyReturned = this.resignationForm.get('company_property_returned')?.value;
    const userId =  this.resignationForm.get('user')?.value;

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
      this.saveResignation();
       // Skip asset check if not marked as returned
    } 
    this.isSubmitting = false;
  }
  saveResignation() {
  
    if (this.resignationForm.valid) {
      if (this.isEditMode) {
        this.separationService.updateResignationById(this.selectedRecord._id, this.resignationForm.value).subscribe(
          (res: any) => {
            this.getResignationByUser();
            this.resignationForm.reset();
            this.toast.success( this.translate.instant('separation.update_success'));
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
            this.toast.success(this.translate.instant('separation.add_success'));
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
        this.totalRecords = this.allResignations.length;
      })
    }
    if (this.view === 'user') {
      this.separationService.getResignationsByUserId(this.currentUser.id).subscribe((res: any) => {
        this.resignationRecords=res.data;
        this.totalRecords = this.resignationRecords.length;
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
  if (status === this.resignationStatuses.Approved && this.selectedRecord && !this.selectedRecord.company_property_returned) {
    this.toast.error(
      this.translate.instant('separation.company_property_not_returned')
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

  onActionClick(event: any) {
    const { action, row } = event;
    this.selectedRecord = row;
    if (action.label === 'Edit') {
      this.isEditMode = true
      this.openDialog(row);
    } else if (action.label === 'Delete') {
      this.deleteDialog(row._id);
    } else if (['In-Progress', 'Approved', 'Pending'].includes(action.label)) {
      this.selectedStatus = row._id;
      this.changedStatus = action.label as string;
      this.openUpdateStatusDialog();
    }
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getResignationByUser();
  }

  onSearchChange(searchText: string) {
    this.currentPage = 1;
    this.getResignationByUser();
  }
}
