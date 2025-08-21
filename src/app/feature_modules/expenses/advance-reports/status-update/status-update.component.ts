import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
@Component({
  selector: 'app-status-update',
  templateUrl: './status-update.component.html',
  styleUrl: './status-update.component.css'
})
export class StatusUpdateComponent {
  private translate: TranslateService = inject(TranslateService);
  updateExpenseReport: FormGroup;
  updateReport: any;
  @Output() advanceReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  data = inject(MAT_DIALOG_DATA);
  commentLength = 0;

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
      primaryApprovalReason: ['', [Validators.required, Validators.maxLength(30), CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      secondaryApprovalReason: ['']
    })
  }

  ngOnInit() {
    this.updateExpenseReport.get('primaryApprovalReason')?.valueChanges.subscribe(value => {
      this.commentLength = value?.length || 0;
    });
  }

  updateApprovedReport() {
    this.updateReport = this.expenseService.advanceReport.getValue();
    let id = this.expenseService.advanceReport.getValue()._id;
    let payload = {
      employee: this.updateReport.employee,
      category: this.updateReport.category,
      amount: this.updateReport.amount,
      comment: this.updateReport.primaryApprovalReason,
      status: this.data.status,
    }

    if (this.updateReport.status === 'Level 1 Approval Pending') {
      payload['primaryApprovalReason'] = this.updateExpenseReport.value.primaryApprovalReason;
    }
    if (this.updateReport.status === 'Level 2 Approval Pending') {
      payload['secondaryApprovalReason'] = this.updateExpenseReport.value.primaryApprovalReason
    }
    if (this.updateExpenseReport.valid) {
      this.expenseService.updateAdvanceReport(id, payload).subscribe((res: any) => {
        this.toast.success(this.translate.instant('expenses.status_updated_success'));
        this.advanceReportRefreshed.emit();
        this.dialogRef.close('success');
      }, (error) => {
        this.toast.error(error);
        this.dialogRef.close('success');
      });
    }
    else {
      this.updateExpenseReport.markAllAsTouched();
    }
    this.advanceReportRefreshed.emit();
  }

  onCommentChange() {
    const comment = this.updateExpenseReport.get('primaryApprovalReason')?.value || '';
    this.commentLength = comment.length;
  }

}
