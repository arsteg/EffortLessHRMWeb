import { Component, Output, EventEmitter, Input, Inject, ChangeDetectorRef } from '@angular/core';
import { AddExpenseReportComponent } from '../add-expense-report/add-expense-report.component';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
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
  formValues: any;
  sharedData: any;
  private sharedDataSubscription: Subscription;
  private refreshSubscription: Subscription;
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
    if (this.expenseService.isEdit.getValue() == true) {
      this.expenseService.expenseReportExpense.subscribe(res => {
        console.log(res)
        this.formValues = res;

        this.expenseReportform.patchValue({
          expenseCategory: res.expenseCategory,
          incurredDate: res.incurredDate,
          amount: res.amount,
          isReimbursable: res.isReimbursable,
          isBillable: res.isBillable,
          reason: res.reason,
          expenseReport: res._id
        })
      })
    }
    const user = this.expenseService.selectedUser.getValue();


    this.isEdit = this.data ? this.data.isEdit : false;
    this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
      this.categories = res.data;
      console.log(this.categories)
    });
    this.updateTotalRate();

    this.expenseService.tempAndCat.subscribe(res => {
      // Your existing code

      // Clear existing form array
      const expenseFieldsArray = this.expenseReportform.get('expenseReportExpenseFields') as FormArray;
      expenseFieldsArray.clear();

      // Add form controls dynamically based on application fields
      this.applicationfields.forEach(field => {
        expenseFieldsArray.push(this.fb.group({
          fieldName: [field.fieldName],
          value: [''] // You can set default value if needed
        }));
      });
    });
  }

  updateTotalRate() {
    const quantity = this.expenseReportform.get('quantity').value;
    // Assuming selectedRate is already calculated or set from somewhere
    console.log(this.selectedType);
    const selectedField = this.applicableCategoryFields.find(field => field.label === this.selectedType);
    this.selectedRate = selectedField ? selectedField.rate : 0;
    console.log(this.selectedRate)
    this.totalRate = this.selectedRate * quantity;
  }

  applicationfieldValue(fieldIndex: number) {
    const fieldValueGroup = this.fb.group({
      expenseApplicationField: ['', Validators.required],
      value: ['', Validators.required],
      type: ['', Validators.required]
    });
    (this.expenseReportform.get('expenseReportExpenseFields') as FormArray).push(fieldValueGroup);
  }
  get fieldsValue() {
    return this.expenseReportform.get('expenseReportExpenseFields') as FormArray;
  }

  ngOnDestroy() {
    // this.sharedDataSubscription.unsubscribe();
    // this.refreshSubscription.unsubscribe();
  }

  onSubmission() {
    const type = this.applicableCategoryFields.find(field => field.label === this.selectedType);
    this.expenseReportform.value.expenseTemplateCategoryFieldValues = type._id;
    console.log('submittedform: ', this.expenseReportform.value)
    // let payload = {
    //   expenseCategory: this.expenseReportform.value.expenseCategory,
    //   incurredDate: this.expenseReportform.value.incurredDate,
    //   amount: this.expenseReportform.value.amount,
    //   isReimbursable: this.expenseReportform.value.isReimbursable,
    //   isBillable: this.expenseReportform.value.isBillable,
    //   reason: this.expenseReportform.value.reason,
    //   expenseAttachments: [],
    //   expenseReport: this.expenseReportform.value.expenseReport,
    //   expenseReportExpenseFields: []
    // }
    // payload.expenseReport = this.expenseService.selectedReport.getValue()._id;
    this.expenseReportform.value.expenseReport = this.expenseService.selectedReport.getValue()._id;
    const expenseReportExpenses = this.expenseService.expenseReportExpense.getValue()._id;
    if (this.expenseService.isEdit.getValue() == true) {
      // update expense report expenses
      if (this.selectedFiles.length >= 0) {
        const attachments: attachments[] = [];

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file: File = this.selectedFiles[i];
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.toString().split(',')[1];
            const fileSize = file.size;
            const fileType = file.type;
            const fileNameParts = file.name.split('.');
            const extention = fileNameParts[fileNameParts.length - 1];

            attachments.push({
              attachmentName: file.name,
              attachmentType: fileType,
              attachmentSize: fileSize,
              extention: extention,
              file: base64String
            });

            if (i === this.selectedFiles.length - 1) {
              this.expenseReportform.value.expenseAttachments = attachments;
            }
          }
        }
      }
      // payload.expenseReportExpenseFields = this.expenseFieldsArray;
      console.log(this.expenseReportform.value);
      this.expenseService.updateExpenseReportExpenses(expenseReportExpenses, this.expenseReportform.value).subscribe((res: any) => {
        this.expenseService.expenseReportExpense.next(res.data);
        this.toast.success('Expense Report of Expenses is Updated!', 'Successfully!!!')
      }
        ,
        // err => {
        //   this.toast.error('This expense report of expenses can not be Updated!', 'Error')
        // }
      );
    }
    else if (this.expenseService.isEdit.getValue() == false && this.expenseService.selectedReport.getValue()._id) {
      // add new expense report expenses  
      // payload.expenseReport = this.expenseService.selectedReport.getValue()._id;
      this.expenseReportform.value.expenseReport = this.expenseService.selectedReport.getValue()._id;
      if (this.selectedFiles.length > 0) {
        const attachments: attachments[] = [];

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file: File = this.selectedFiles[i];
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.toString().split(',')[1];
            const fileSize = file.size;
            const fileType = file.type;
            const fileNameParts = file.name.split('.');
            const extention = fileNameParts[fileNameParts.length - 1];

            attachments.push({
              attachmentName: file.name,
              attachmentType: fileType,
              attachmentSize: fileSize,
              extention: extention,
              file: base64String
            });

            if (i === this.selectedFiles.length - 1) {
              // payload.expenseAttachments = attachments;
              this.expenseReportform.value.expenseAttachments = attachments;
              console.log(this.expenseReportform.value)
              this.expenseService.addExpenseReportExpenses(this.expenseReportform.value).subscribe((res: any) => {
                console.log(res.data);
                this.expenseService.expenseReportExpense.next(res.data);
                this.toast.success('Expense Report of Expenses is Created!', 'Successfully!!!')
              }
                // ,
                // err => {
                //   this.toast.error('This expense report of expenses can not be Added!', 'Error')
                // }
              )
            }
          }
        }
      }
    }
    else (this.expenseService.isEdit.getValue() == false && !this.expenseService.selectedReport.getValue()._id)
    {
      if (this.selectedFiles.length > 0) {
        const attachments: attachments[] = [];

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file: File = this.selectedFiles[i];
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.toString().split(',')[1];
            const fileSize = file.size;
            const fileType = file.type;
            const fileNameParts = file.name.split('.');
            const extention = fileNameParts[fileNameParts.length - 1];
            attachments.push({
              attachmentName: file.name,
              attachmentType: fileType,
              attachmentSize: fileSize,
              extention: extention,
              file: base64String
            });
            if (i === this.selectedFiles.length - 1) {
              // payload.expenseAttachments = attachments;
              this.expenseReportform.value.expenseAttachments = attachments;
              console.log(this.expenseReportform.value)
              // this.expenseService.expenseReportExpense.next(this.expenseReportform.value);
            }
          }
        }
      }
    }
    this.expenseService.expenseReportExpense.next(this.expenseReportform.value)
    this.expenseService.triggerUpdateTable();
    this.dialogRef.close();
    this.changeStep.emit(1);

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

      this.applicationfields.forEach(field => {
        let expenseApplicationField = null;
        if (field.expenseApplicationFieldValues && field.expenseApplicationFieldValues.length > 0) {
          expenseApplicationField = field.expenseApplicationFieldValues[0].expenseApplicationField;
        } else {
          expenseApplicationField = field.expenseApplicationField || '';
        }
        this.expenseFieldsArray.push(this.fb.group({
          type: [field.fieldName],
          value: [''],
          expenseApplicationField: [expenseApplicationField]
        }));
      });
      console.log(this.expenseFieldsArray.value)
    });

    this.expenseService.tempAndCat.subscribe(res => {
      this.categoryType = res.data?.find(catType => catType._id == categoryId)
      let category = res.details?.find(cat => cat.expenseCategory == categoryId);
      this.expenseService.getApplicableFieldByTemplateAndCategory(category.expenseTemplate, category.expenseCategory).subscribe((res: any) => {
        this.applicableCategoryFields = res.data['expenseTemplateCategoryFieldValues'];
      });
    })
  }


  onTypeChange(selectedType: string): void {
    const selectedField = this.applicableCategoryFields.find(field => field.label === selectedType);
    console.log(selectedField)
    this.expenseReportform.value.expenseTemplateCategoryFieldValues = selectedField._id
    this.selectedRate = selectedField ? selectedField.rate : 0;
  }

  // updateFieldsValue() {
  //   const expenseReportExpenseFieldsArray = this.expenseReportform.get('expenseReportExpenseFields') as FormArray;
  //   expenseReportExpenseFieldsArray.clear();
  //   this.applicableCategoryFields.forEach(field => {
  //     expenseReportExpenseFieldsArray.push(this.fb.group({
  //       expenseApplicationField: [field.label, Validators.required],
  //       value: ['', Validators.required],
  //       type: [field.fieldType, Validators.required]
  //     }));
  //   });
  // }
}
