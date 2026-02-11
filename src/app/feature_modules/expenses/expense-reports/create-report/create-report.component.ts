import { Component, Output, EventEmitter, Input, Inject, DestroyRef, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { th } from 'date-fns/locale';

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.css']
})
export class CreateReportComponent {
  private readonly translate = inject(TranslateService);
  @Output() changeStep: any = new EventEmitter();
  @Output() close: any = new EventEmitter();
  @Output() expenseReportExpensesEmitter = new EventEmitter<any>();
  categories: any;
  expenseReportform: FormGroup;
  isEdit: boolean;
  sharedData: any;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  minDate = new Date();
  labelPosition: true | false = true;
  attachments: '';
  selectedFiles: any = [];
  selectedCategoryId: string;
  applicationfields: any;
  categoryFields: any;
  applicableCategoryFields: any;
  selectedRate: number;
  selectedType: string;
  categoryType;
  totalRate: number;
  expenseFieldsArray: FormArray;
  @Input() changeMode: string;
  user = JSON.parse(localStorage.getItem('currentUser'));
  private readonly destroyRef = inject(DestroyRef);
  expenseData: any;
  isSubmitting: boolean = false;
  documentMandatory: boolean;
  private dialog: MatDialog;
  public selectedAttachment: any;
  documentName: any;

  constructor(
    public expenseService: ExpensesService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean },
    private toast: ToastrService
  ) {
    this.expenseReportform = this.fb.group({
      expenseCategory: ['', Validators.required],
      incurredDate: ['', [Validators.required, this.futureDateValidator()]],
      amount: [0, [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      isReimbursable: [false],
      isBillable: [false],
      reason: [''],
      expenseAttachments: [this.attachments],
      expenseReport: [''],
      expenseTemplateCategoryFieldValues: [''],
      expenseReportExpenseFields: this.fb.array([])
    });

    this.minDate.setDate(this.minDate.getDate() - 1);
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
    this.expenseFieldsArray = this.expenseReportform.get('expenseReportExpenseFields') as FormArray;
  }

  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Don't validate if the field is empty, leave it to Validators.required
      }

      const today = new Date().getTime();
      const incurredDate = new Date(control.value).getTime();

      // Clear the time part of today's date to allow for future dates on the same day.
      const todayAtMidnight = new Date();
      todayAtMidnight.setHours(0, 0, 0, 0);

      // Check if the incurred date is before or equal to today's date (at midnight)
      if (incurredDate > todayAtMidnight.getTime()) {
        return { 'futureDate': { value: control.value } };
      }
      return null;
    };
  }

  ngOnInit() {
    this.isSubmitting = false;
    this.initChanges();
    this.isEdit = this.data ? this.data.isEdit : false;
    const user = this.expenseService.tabIndex.getValue() === 1 ? this.user.id : this.expenseService.selectedUser.getValue();
    if (this.isEdit) {
      this.loadExpenseReportData();
    } else {
      this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
        this.categories = res.data;
      });
    }
  }

  initChanges() {
    this.expenseReportform.get('amount').valueChanges.subscribe((value: string) => {
      this.setPermissions();
    });

    this.expenseReportform.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.isSubmitting) {
        this.isSubmitting = false;
      }
    });
  }
  loadExpenseReportData() {
    const expenseFieldsArray = this.expenseReportform.get('expenseReportExpenseFields') as FormArray;
    expenseFieldsArray.clear();
    this.expenseService.expenseReportExpense.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.documentName = res.documentName;
      this.selectedRate = res?.type?.rate || 0;
      this.expenseReportform.patchValue({
        expenseCategory: res?.expenseCategory,
        incurredDate: res?.incurredDate,
        amount: res.amount,
        isReimbursable: res.isReimbursable,
        isBillable: res.isBillable,
        reason: res.reason,
        expenseReport: res._id,
        quantity: res.quantity,
        type: res?.type?._id,
        expenseAttachments: res.documentLink || this.selectedFiles,
        expenseTemplateCategoryFieldValues: res?.expenseTemplateCategoryFieldValues,
        expenseReportExpenseFields: res.expenseReportExpenseFields
      });
    });
    let categoryId = this.expenseService.expenseReportExpense.getValue().expenseCategory;
    this.onCategorySelection(categoryId);
  }

  onSubmission() {
    this.isSubmitting = true;
    if (this.expenseReportform.valid) {
      const payload = this.createPayload();
      if (this.selectedFiles.length > 0) {
        this.processAttachments(payload);
      } else {
        this.submitExpenseReport(payload);
      }
    }
    else {
      this.expenseReportform.markAllAsTouched();
      this.toast.warning(this.translate.instant('expenses.requiredFields'));
      this.isSubmitting = false;
    }
  }

  createPayload() {
    return {
      expenseCategory: this.expenseReportform.value.expenseCategory,
      incurredDate: this.expenseReportform.value.incurredDate,
      expenseTemplateCategoryFieldValues: '',
      quantity: this.expenseReportform.value.quantity,
      type: this.expenseReportform.value.type,
      amount: this.expenseReportform.value.amount || this.totalRate,
      isReimbursable: this.expenseReportform.value.isReimbursable,
      isBillable: this.expenseReportform.value.isBillable,
      reason: this.expenseReportform.value.reason,
      expenseReport: '',
      expenseAttachments: [],
      expenseReportExpenseFields: this.expenseFieldsArray.value
    };
  }

  processAttachments(payload) {
    const attachmentsPromises = this.selectedFiles.map(file => this.processFile(file));

    Promise.all(attachmentsPromises).then(attachments => {
      payload.expenseAttachments = attachments;
      this.submitExpenseReport(payload);
    }).catch(error => {
    });
  }

  submitExpenseReport(payload) {
    this.isSubmitting = true;
    if (this.isEdit) {
      this.updateExpenseReport(payload);
    } else {
      this.addExpenseReport(payload);
    }
  }

  updateExpenseReport(payload) {
    this.expenseService.expenseReportExpense.subscribe(res => {
      payload.expenseTemplateCategoryFieldValues = res.expenseTemplateCategoryFieldValues;
      payload.expenseReport = res.expenseReport;
    });
    const expenseReportExpId = this.expenseService.expenseReportExpId.getValue();
    this.expenseService.updateExpenseReportExpenses(expenseReportExpId, payload).subscribe(
      (result: any) => {
        this.expenseService.expenseReportExpense.next(result.data);
        this.toast.success(this.translate.instant('expenses.expense_updated_success'));
        this.expenseReportExpensesEmitter.emit({ action: 'update', data: result.data, close: true }); // Emit event on update
        this.dialogRef.close();
      },
      (err) => {
        this.toast.error(err);
        this.isSubmitting = false;
      }
    );
  }

  addExpenseReport(payload) {
    this.isSubmitting = true;
    const report = this.expenseService.selectedReport.getValue();
    payload.expenseTemplateCategoryFieldValues = this.expenseService.expenseTemplateCategoryFieldValues.getValue();
    payload.expenseReport = report._id;
    this.expenseService.addExpenseReportExpenses(payload).subscribe(
      (result: any) => {
        this.expenseService.expenseReportExpense.next(result);
        this.toast.success(this.translate.instant('expenses.expense_created_success'));
        this.expenseReportExpensesEmitter.emit({ action: 'add', data: result, close: true });
        this.dialogRef.close();
        this.closeModal();
      },
      (err) => {
        this.toast.error(err);
        this.isSubmitting = false;
      }
    );
  }

  processFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.toString().split(',')[1];
        const fileSize = file.size;
        const fileNameParts = file.name.split('.');
        const extention = '.' + fileNameParts[fileNameParts.length - 1];
        const attachment = {
          attachmentName: file.name,
          attachmentType: file.type,
          attachmentSize: fileSize,
          extention: extention,
          file: base64String
        };
        resolve(attachment);
      };
      reader.onerror = error => {
        reject(error);
      };
    });
  }

  onFileSelected(event: any) {
    const newFiles: FileList = event.target.files;
    if (newFiles) {
      const previousFiles = this.selectedFiles || [];
      this.selectedFiles = previousFiles.concat(Array.from(newFiles));
      this.expenseReportform.get('expenseAttachments')?.setValue(this.selectedFiles.length > 0 ? 'files_selected' : '');
      this.expenseReportform.get('expenseAttachments')?.updateValueAndValidity();
      event.target.value = '';
    }
  }
  removeFile(index: number) {
    if (index !== -1) {
      this.selectedFiles.splice(index, 1);
      this.expenseReportform.get('expenseAttachments')?.setValue(this.selectedFiles.length > 0 ? 'files_selected' : '');
      this.expenseReportform.get('expenseAttachments')?.updateValueAndValidity();
    }
  }

  openAttachment() {
    const fileUrl = this.expenseReportform.get('expenseAttachments').value;
    if (fileUrl && typeof fileUrl === 'string') {
      window.open(fileUrl, '_blank');
    }
  }

  removeExistingAttachment() {
    this.expenseReportform.get('expenseAttachments').setValue(null);
  }

  closeModal() {
    this.expenseService.triggerUpdateTable();
    this.close.emit(true);
    this.changeStep.emit(1);
  }

  toggleIsReimbursable(event: any) {
    const value = event.value === 'true';
    this.expenseReportform.patchValue({ isReimbursable: value });
    this.expenseReportform.patchValue({ isBillable: !value });
  }

  onCategorySelection(categoryId: string) {
    this.expenseService.getApplicationFieldbyCategory(categoryId).subscribe((res: any) => {
      this.applicationfields = res.data;
      this.expenseFieldsArray.clear();
      this.populateExpenseFieldsArray(this.isEdit);
    });
    const user = this.expenseService.selectedUser.getValue();
    this.expenseService.getExpenseCategoryByUser(user).subscribe((response: any) => {
      const results = response.details;
      this.categories = response.data;
      this.expenseService.getApplicableFieldByTemplateAndCategory(results[0]?.expenseTemplate._id, categoryId).subscribe((res: any) => {
        this.applicableCategoryFields = res.data['expenseTemplateCategoryFieldValues'];
        this.expenseData = res.data;
        this.setPermissions();
      });
    });
  }

  setPermissions() {
    let report = this.expenseService.selectedReport.getValue();
    if (this.expenseData?.expenseTemplate?.applyforSameCategorySamedate) {
      if (report?.expenseReportExpense?.length) {
        const sameDateRecord = report.expenseReportExpense.find((expense) => {
          return expense.incurredDate === new Date(this.expenseReportform.value.incurredDate)?.toISOString() &&
            expense.expenseCategory === this.expenseReportform.value.expenseCategory &&
            expense._id !== this.expenseReportform.value.expenseReport;
        });
        const incurredDateControl = this.expenseReportform.get('incurredDate');
        const currentErrors = incurredDateControl.errors || {};

        if (sameDateRecord) {
          incurredDateControl.setErrors({ ...currentErrors, 'duplicate': true });
        } else {
          // Remove only the 'duplicate' error while preserving other errors
          const { duplicate, ...remainingErrors } = currentErrors;
          incurredDateControl.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
        }
      }
    }

    // Max amount permission
    if (this.expenseData?.isMaximumAmountPerExpenseSet) {
      let maxAmount = this.expenseData.maximumAmountPerExpense;
      const amountControl = this.expenseReportform.get('amount');
      const currentErrors = amountControl.errors || {};

      if (amountControl.value > maxAmount) {
        amountControl.setErrors({ ...currentErrors, 'exceeds': true });
      } else {
        // Remove only the 'exceeds' error while preserving other errors
        const { exceeds, ...remainingErrors } = currentErrors;
        amountControl.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
      }
    }
    // Max amount without receipt
    if (this.expenseData?.isMaximumAmountWithoutReceiptSet) {
      let maxAmount = this.expenseData.maximumAmountWithoutReceipt;
      if (this.expenseReportform.get('amount').value > maxAmount) {
        this.expenseReportform.get('expenseAttachments').setValidators([Validators.required]);
        this.expenseReportform.get('expenseAttachments').updateValueAndValidity();
      } else {
        this.expenseReportform.get('expenseAttachments').setValidators([]);
        this.expenseReportform.get('expenseAttachments').updateValueAndValidity();
      }
    }
  }

  populateExpenseFieldsArray(isEdit: boolean) {
    const expenseReportExpenseFields = isEdit ? this.expenseService.expenseReportExpense.getValue().expenseReportExpenseFields : [];
    this.applicationfields.forEach(field => {
      let expenseApplicationField = field.expenseApplicationFieldValues?.[0]?.expenseApplicationField || field.expenseApplicationField || null;
      const matchingField = expenseReportExpenseFields.find(reportField => reportField.expenseApplicationField === expenseApplicationField);
      const value = matchingField ? matchingField.value : '';
      const formGroupConfig: any = {
        type: [field.fieldType],
        value: [value],
        expenseApplicationField: [expenseApplicationField],
        fromDate: [matchingField ? matchingField.fromDate : ''],
        toDate: [matchingField ? matchingField.toDate : '']
      };
      this.expenseFieldsArray.push(this.fb.group(formGroupConfig));
    });
  }

  onTypeChange(selectedType: string): void {
    this.selectedType = selectedType;

    const selectedField = this.applicableCategoryFields?.find(field => field._id === selectedType);

    this.expenseReportform.value.expenseTemplateCategoryFieldValues = selectedType;
    this.expenseService.expenseTemplateCategoryFieldValues.next(selectedType);
    this.selectedRate = selectedField ? selectedField?.rate : 0;
    this.updateTotalRate();
  }

  updateTotalRate() {
    const quantity = this.expenseReportform.get('quantity').value;
    this.totalRate = this.selectedRate * quantity;
    this.expenseReportform.patchValue({ amount: this.totalRate });
    this.setPermissions();
  }
}