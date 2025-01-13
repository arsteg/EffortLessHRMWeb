import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { SeparationService } from 'src/app/_services/separation.service';

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
  terminations: any;
  userTerminations: any;
  displayedColumns: string[] = [
    'termination_date', 'termination_reason', 'notice_given',
    'performance_warnings', 'severance_paid', 'final_pay_processed',
    'company_property_returned', 'exit_interview_date', 'legal_compliance',
    'unemployment_claim', 'termination_status'
  ];
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @ViewChild('updateStatusResignation') updateStatusResignation: TemplateRef<any>;
  selectedStatus: string;
  changedStatus: string;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(private separationService: SeparationService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private commonService: CommonService,
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
      termination_status: ['pending'],
      unemployment_claim: [true]
    });
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data['data'];
    });
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

  getTerminations() {
    if (this.view === 'admin') {
      this.separationService.getTerminationByCompany().subscribe((res: any) => {
        this.terminations = res.data;
      });
    }else{
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
    this.terminationForm.patchValue({ termination_status: 'pending' });
    this.separationService.addTermination(this.terminationForm.value).subscribe((res: any) => {
      this.getTerminations();
      this.resetForm();
      this.toast.success('Termination Created', 'Successfully');
    },
      err => {
        this.toast.error('Termination can not be Created', 'Error');
      });
  }

  updateTerminationStatus(id: string, status: string) {
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

  deleteTermination(id: string) {
    this.separationService.deleteTerminationById(id).subscribe((res: any) => {
      this.getTerminations();
    });
  }
}