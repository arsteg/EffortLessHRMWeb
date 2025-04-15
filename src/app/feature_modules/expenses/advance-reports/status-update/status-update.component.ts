import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';

@Component({
  selector: 'app-status-update',
  templateUrl: './status-update.component.html',
  styleUrl: './status-update.component.css'
})
export class StatusUpdateComponent {
  updateExpenseReport: FormGroup;
  updateReport: any;
  @Output() advanceReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  data = inject(MAT_DIALOG_DATA);

  constructor(
    public expenseService: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private dialogRef: MatDialogRef<StatusUpdateComponent>) {
    this.updateExpenseReport = this.fb.group({
      employee: [''],
      category: [''],
      amount: [],
      comment: [''],
      status: [''],
      primaryApprovalReason: [''],
      secondaryApprovalReason: ['']
    })
  }

  updateApprovedReport() {
    this.updateReport = this.expenseService.advanceReport.getValue();
    let id = this.expenseService.advanceReport.getValue()._id;
    let payload = {
      employee: this.updateReport.employee,
      category: this.updateReport.category,
      amount: this.updateReport.amount,
      comment: this.updateReport.comment,
      status: this.data.status,
    }

    if(this.updateReport.status === 'Level 1 Approval Pending'){
      payload['primaryApprovalReason'] = this.updateExpenseReport.value.primaryApprovalReason;
    }
    if(this.updateReport.status === 'Level 2 Approval Pending'){
      payload['secondaryApprovalReason']= this.updateExpenseReport.value.primaryApprovalReason
    }
    this.expenseService.updateAdvanceReport(id, payload).subscribe((res: any) => {
      this.toast.success('Status Updated Successfully!');
      this.advanceReportRefreshed.emit();
      this.dialogRef.close('success');
    }, (error)=>{
      this.toast.error(error);
      this.dialogRef.close('success');
    });
    this.advanceReportRefreshed.emit();
  }


}
