import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  

  constructor(private dialog: MatDialog,
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

  ngOnInit() {
  }

  updateApprovedReport() {
    this.updateReport = this.expenseService.advanceReport.getValue();
    let id = this.expenseService.advanceReport.getValue()._id;
    let payload = {
      employee: this.updateReport.employee,
      category: this.updateReport.category,
      amount: this.updateReport.amount,
      comment: this.updateReport.comment,
      status: this.updateReport.status,
      primaryApprovalReason: this.updateExpenseReport.value.primaryApprovalReason,
      secondaryApprovalReason: this.updateExpenseReport.value.primaryApprovalReason
    }
    this.expenseService.updateAdvanceReport(id, payload).subscribe((res: any) => {
      this.toast.success('Status Updated Successfully!');
      this.advanceReportRefreshed.emit();
      this.dialogRef.close();
    })
  }

  
}
