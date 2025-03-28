import { Component, Output, EventEmitter, Input, Inject, ChangeDetectorRef } from '@angular/core';
import { AddExpenseReportComponent } from '../add-expense-report/add-expense-report.component';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { attachments } from 'src/app/models/expenses';

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.component.html',
  styleUrl: './create-report.component.css'
})
export class CreateReportComponent {
  @Output() changeStep: any = new EventEmitter();
  @Output() close: any = new EventEmitter();
  categories: any;
  expenseReportform: FormGroup;
  isEdit: boolean;
  sharedData: any;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  minDate = new Date();
  labelPosition: true | false = true;
  attachments: attachments[] = [];
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
  @Output() expenseReportExpensesEmitter = new EventEmitter<any>();

  constructor(public expenseService: ExpensesService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddExpenseReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean },
    private toast: ToastrService) {
    this.expenseReportform = this.fb.group({
      expenseCategory: [''],
      incurredDate: [],
      amount: [0],
      type: [''],
      quantity: [1],
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

  ngOnInit() {
    this.isEdit = this.data ? this.data.isEdit : false;
    const user = this.expenseService.tabIndex.getValue() === 1 ? this.user.id : this.expenseService.selectedUser.getValue();
    if (this.isEdit) {
      this.loadExpenseReportData();
    } else {
      this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
        this.categories = res.data;
      });
    }
    this.updateTotalRate();
  }

  loadExpenseReportData() {
    const expenseFieldsArray = this.expenseReportform.get('expenseReportExpenseFields') as FormArray;
    expenseFieldsArray.clear();
    this.expenseService.expenseReportExpense.subscribe(res => {
      this.expenseReportform.patchValue({
        expenseCategory: res.expenseCategory,
        incurredDate: res.incurredDate,
        amount: res.amount,
        isReimbursable: res.isReimbursable,
        isBillable: res.isBillable,
        reason: res.reason,
        expenseReport: res._id,
        quantity: res.quantity,
        type: res.type,
        expenseAttachments: res.documentLink,
        expenseTemplateCategoryFieldValues: res.expenseTemplateCategoryFieldValues,
        expenseReportExpenseFields: res.expenseReportExpenseFields
      });
    });
    let categoryId = this.expenseService.expenseReportExpense.getValue().expenseCategory;
    this.onCategorySelection(categoryId);
  }

  onSubmission() {
    const payload = this.createPayload();

    if (this.selectedFiles.length > 0) {
      this.processAttachments(payload);
    } else {
      this.submitExpenseReport(payload);
    }
  }

  createPayload() {
    return {
      expenseCategory: this.expenseReportform.value.expenseCategory,
      incurredDate: this.expenseReportform.value.incurredDate,
      expenseTemplateCategoryFieldValues: '',
      quantity: this.expenseReportform.value.quantity,
      type: this.expenseReportform.value.type,
      amount: this.totalRate || this.expenseReportform.value.amount,
      isReimbursable: this.expenseReportform.value.isReimbursable,
      isBillable: this.expenseReportform.value.isBillable,
      reason: this.expenseReportform.value.reason,
      expenseReport: '',
      expenseAttachments: [],
      expenseReportExpenseFields: this.expenseFieldsArray.value,
    };
  }

  processAttachments(payload) {
    const attachmentsPromises = this.selectedFiles.map(file => this.processFile(file));

    Promise.all(attachmentsPromises).then(attachments => {
      payload.expenseAttachments = attachments;
      this.submitExpenseReport(payload);
    }).catch(error => {
      console.error('Error processing files:', error);
    });
  }

  submitExpenseReport(payload) {
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
        this.toast.success('Expense Report of Expenses is Updated!', 'Successfully!!!');
        this.dialogRef.close();
      },
      (err) => {
        this.toast.error('This expense report of expenses cannot be Updated!', 'Error');
      }
    );
  }

  addExpenseReport(payload) {
    const report = this.expenseService.selectedReport.getValue();
    payload.expenseTemplateCategoryFieldValues = this.expenseService.expenseTemplateCategoryFieldValues.getValue();
    payload.expenseReport = report._id;
    this.expenseService.addExpenseReportExpenses(payload).subscribe(
      (result: any) => {
        this.expenseService.expenseReportExpense.next(result.data);
        this.toast.success('Expense Report of Expenses is Created!', 'Successfully!!!');
        this.dialogRef.close();
        this.closeModal();
      },
      (err) => {
        this.toast.error('This expense report of expenses can not be Added!', 'Error');
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
        const fileType = file.type;
        const fileNameParts = file.name.split('.');
        const extention = '.' + fileNameParts[fileNameParts.length - 1];
        const attachment = {
          attachmentName: file.name,
          attachmentType: fileType,
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

  onFileSelect(event) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file: File = files.item(i);
        if (file) {
          this.selectedFiles.push(file);
        }
      }
    }
  }

  removeFile(index: number) {
    if (index !== -1) {
      this.selectedFiles.splice(index, 1);
    }
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
      this.expenseService.getApplicableFieldByTemplateAndCategory(results[0]?.expenseTemplate, categoryId).subscribe((res: any) => {
        this.applicableCategoryFields = res.data['expenseTemplateCategoryFieldValues'];
      });
    });
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
    const selectedField = this.applicableCategoryFields?.find(field => field.label === selectedType);
    this.expenseReportform.value.expenseTemplateCategoryFieldValues = selectedField._id;
    this.expenseService.expenseTemplateCategoryFieldValues.next(selectedField._id);
    this.selectedRate = selectedField ? selectedField.rate : 0;
    this.updateTotalRate();
  }

  updateTotalRate() {
    const quantity = this.expenseReportform.get('quantity').value;
    this.totalRate = this.selectedRate * quantity;
  }
}