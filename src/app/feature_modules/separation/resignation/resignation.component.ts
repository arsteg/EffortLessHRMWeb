import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SeparationService } from 'src/app/_services/separation.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

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

  constructor(private fb: FormBuilder,
    private dialog: MatDialog,
    private separationService: SeparationService,
    private toast: ToastrService,
    private commonService: CommonService) {
    this.resignationForm = this.fb.group({
      user: [''],
      resignation_date: [''],
      last_working_day: [''],
      notice_period: [0],
      resignation_reason: [''],
      exit_interview_date: [''],
      handover_complete: [false],
      company_property_returned: [false],
      final_pay_processed: [false],
      exit_feedback: [''],
      resignation_status: ['pending']
    });
  }

  ngOnInit(): void {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data['data'];
      this.getResignationByUser();
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

  onSubmit(): void {
    this.resignationForm.patchValue({
      user: this.currentUser.id,
      resignation_status: 'pending'
    });

    if (this.resignationForm.valid) {
      const resignation = this.resignationForm.value;
      if (this.isEditMode) {
        let id;
        this.separationService.updateResignationById(id, this.resignationForm.value).subscribe((res: any) => {
          const index = this.resignationRecords.findIndex(item => item.user === resignation.user);
          this.resignationRecords[index] = resignation;
          this.dataSource.data = this.resignationRecords;
        });
      } else {
        this.separationService.addResignation(this.resignationForm.value).subscribe((res: any) => {
          this.resignationRecords = res.data;

          this.resignationForm.reset();
          this.toast.success('Resignation Added', 'Successfully');
        },
          err => { this.toast.error('Resignation cannot be added', 'Error'); });
      }
      this.dialogRef.close();
    }
  }

  getResignationByUser() {
    if (this.view == 'user') {
      this.separationService.getResignationsByUserId(this.currentUser.id).subscribe((res: any) => {
        this.resignationRecords = res.data;
        // this.dataSource.data = this.resignationRecords;
      });
    }
    else if (this.view == 'admin'){
      this.separationService.getResignationsByCompany().subscribe((res: any)=>{
        this.allResignations = res.data;
      })
    }
  }

  getMatchingUser(userId: string) {
    const matchingUser = this.users.find(user => user.id === userId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Removed';
  }

  updateResignationStatus(resignation: string, status: string) {
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

  deleteResignation(id: string) {
    this.separationService.deleteResignationById(id).subscribe((res: any) => {
      this.getResignationByUser();
      this.toast.success('Successfully Deleted!!!', 'Resignation')
    },
      (err) => {
        this.toast.error('This Resignation Can not be deleted!', 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.selectedRecord.resignation_status != 'Pending'
        {
          this.deleteResignation(id);
        }
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

}
