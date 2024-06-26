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
    console.log('expense reports')
    if (this.expenseService.isEdit.getValue() == true) {
      const expenseFieldsArray = this.expenseReportform.get('expenseReportExpenseFields') as FormArray;
      expenseFieldsArray.clear();

      this.expenseService.expenseReportExpense.subscribe(res => {
        console.log(res)
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
        console.log(this.expenseReportform.value);
      });
      let categoryId = this.expenseService.expenseReportExpense.getValue().expenseCategory;
      this.onCategorySelection(categoryId);
      this.updateTotalRate();
    }
   
    if (this.expenseService.tabIndex.getValue() === 1) {
      const user = this.user.id;
      this.isEdit = this.data ? this.data.isEdit : false;
      this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
        this.categories = res.data;
      });
    }
    else {
      const user = this.expenseService.selectedUser.getValue();
      this.isEdit = this.data ? this.data.isEdit : false;
      console.log('new report selected', user)
      this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
        this.categories = res.data;
      });
    }
    this.updateTotalRate();
  }


  onSubmission() {
    const payload = {
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

    if (this.selectedFiles.length > 0) {
      const attachmentsPromises = this.selectedFiles.map(file => this.processFile(file));

      Promise.all(attachmentsPromises).then(attachments => {
        payload.expenseAttachments = attachments;

        if (this.expenseService.isEdit.getValue() == true) {
          this.expenseService.expenseReportExpense.subscribe(res => {
            payload.expenseTemplateCategoryFieldValues = res.expenseTemplateCategoryFieldValues;
            payload.expenseReport = res.expenseReport
          });
          const expenseReportExpId = this.expenseService.expenseReportExpId.getValue();
          if (payload.expenseAttachments.length >= 1) {
            console.log(payload.expenseAttachments)
          }
          console.log(payload)
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
        } else if (this.expenseService.isEdit.getValue() == false) {
          payload.expenseTemplateCategoryFieldValues = this.expenseService.expenseTemplateCategoryFieldValues.getValue();
          if (this.expenseService.changeMode.getValue() == 'Update') {
            const report = this.expenseService.selectedReport.getValue();
            payload.expenseReport = report._id;
            console.log('add: ', payload);
            this.expenseService.addExpenseReportExpenses(payload).subscribe(
              (result: any) => {
                this.expenseService.expenseReportExpense.next(result.data);
                this.toast.success('Expense Report of Expenses is Created!', 'Successfully!!!');
                this.dialogRef.close();
              },
              (err) => {
                this.toast.error('This expense report of expenses can not be Added!', 'Error');
              }
            );
          }
          else {
            payload.expenseReport = null;
            this.changeStep.emit(1)
            this.expenseService.expenseReportExpense.next(payload);
            this.dialogRef.close();
            this.closeModal();
          }
        }

      }).catch(error => {
        console.error('Error processing files:', error);
      });
    } else {
      if (this.expenseService.isEdit.getValue() == true) {
        this.expenseService.expenseReportExpense.subscribe(res => {
          payload.expenseTemplateCategoryFieldValues = res.expenseTemplateCategoryFieldValues;
          payload.expenseReport = res.expenseReport
        });
        const expenseReportExpId = this.expenseService.expenseReportExpId.getValue();
        if (payload.expenseAttachments.length >= 1) {
          console.log(payload.expenseAttachments)
        }
        console.log(payload);

        this.expenseService.updateExpenseReportExpenses(expenseReportExpId, payload).subscribe(
          (result: any) => {
            this.expenseService.expenseReportExpense.next(result.data);
            this.changeStep.emit(1);
            this.toast.success('Expense Report of Expenses is Updated!', 'Successfully!!!');
            this.dialogRef.close();
          },
          (err) => {
            this.toast.error('This expense report of expenses cannot be Updated!', 'Error');
          }
        );
      } else if (this.expenseService.isEdit.getValue() == false) {
        const report = this.expenseService.selectedReport.getValue();
        console.log(report);
        payload.expenseTemplateCategoryFieldValues = this.expenseService.expenseTemplateCategoryFieldValues.getValue();

        if (report._id) {
          payload.expenseReport = report._id;
          this.expenseService.addExpenseReportExpenses(payload).subscribe(
            (result: any) => {
              this.expenseService.expenseReportExpense.next(result.data);
              this.dialogRef.close();
            });
        } else {
          const expenseReportExpense = {
            expenseCategory: this.expenseReportform.value.expenseCategory,
            incurredDate: this.expenseReportform.value.incurredDate,
            expenseTemplateCategoryFieldValues: '',
            quantity: this.expenseReportform.value.quantity,
            type: this.expenseReportform.value.type,
            amount: this.totalRate || this.expenseReportform.value.amount,
            isReimbursable: this.expenseReportform.value.isReimbursable,
            isBillable: this.expenseReportform.value.isBillable,
            reason: this.expenseReportform.value.reason,
            expenseAttachments: [],
            expenseReportExpenseFields: this.expenseFieldsArray.value,
          };

          console.log(expenseReportExpense);

          this.expenseService.expenseReportExpense.next(expenseReportExpense);
          this.changeStep.emit(1);
        }
        // payload.expenseReport = report._id;
        // payload.expenseTemplateCategoryFieldValues = this.expenseService.expenseTemplateCategoryFieldValues.getValue();
        // this.expenseService.addExpenseReportExpenses(payload).subscribe(
        //   (result: any) => {
        //     this.expenseService.expenseReportExpense.next(result.data);
        //     this.changeStep.emit(1);
        //     this.toast.success('Expense Report of Expenses is Created!', 'Successfully!!!');
        //   },
        //   (err) => {
        //     this.toast.error('This expense report of expenses can not be Added!', 'Error');
        //   }
        // );
      }
    }
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
    const isEdit = this.expenseService.isEdit.getValue();
    if (isEdit) {
      this.expenseService.getApplicationFieldbyCategory(categoryId).subscribe((res: any) => {
        this.applicationfields = res.data;
        this.expenseFieldsArray.clear();
        this.expenseFieldsArray = this.expenseReportform.get('expenseReportExpenseFields') as FormArray;
        const expenseReportExpenseFields = this.expenseService.expenseReportExpense.getValue().expenseReportExpenseFields;
        this.applicationfields.forEach(field => {
          let expenseApplicationField = null;
          if (field.expenseApplicationFieldValues && field.expenseApplicationFieldValues.length > 0) {
            expenseApplicationField = field.expenseApplicationFieldValues[0].expenseApplicationField;
          } else {
            expenseApplicationField = field.expenseApplicationField || null;
          }

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
      });
      const user = this.expenseService.selectedUser.getValue();
      this.expenseService.getExpenseCategoryByUser(user).subscribe((response: any) => {
        const results = response.details;
        this.expenseService.getApplicableFieldByTemplateAndCategory(results[0]?.expenseTemplate, categoryId).subscribe((res: any) => {
          this.applicableCategoryFields = res.data['expenseTemplateCategoryFieldValues'];
        });
      });
    } else {
      let categoryId = this.expenseReportform.value.expenseCategory;
      this.expenseService.getApplicationFieldbyCategory(categoryId).subscribe((res: any) => {
        this.applicationfields = res.data;
        this.expenseFieldsArray.clear();
        this.applicationfields.forEach(field => {
          let expenseApplicationField = null;
          if (field.expenseApplicationFieldValues && field.expenseApplicationFieldValues.length > 0) {
            expenseApplicationField = field.expenseApplicationFieldValues[0].expenseApplicationField;
          } else {
            expenseApplicationField = field.expenseApplicationField || null;
          }
          const formGroupConfig: any = {
            type: [field.fieldType],
            value: [''],
            expenseApplicationField: [expenseApplicationField],
            fromDate: [''],
            toDate: ['']
          };
          this.expenseFieldsArray.push(this.fb.group(formGroupConfig));
        });
        this.expenseFieldsArray.controls.forEach((control: FormGroup) => {
          control.get('value').reset('');
        });
      });
      this.expenseService.tempAndCat.subscribe(res => {
        console.log(res)
        const expCategory = res.details;
        // this.categoryType = res.data?.find(catType => catType._id === categoryId);
        console.log(expCategory, categoryId)
        const category = res.details?.find(cat => cat.expenseCategory === categoryId);
        this.expenseService.getApplicableFieldByTemplateAndCategory(category.expenseTemplate, category.expenseCategory).subscribe((res: any) => {
          this.applicableCategoryFields = res.data['expenseTemplateCategoryFieldValues'];
        });
      });
    }
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
    if (this.expenseService.isEdit.getValue() == true) {
      const selectedField = this.applicableCategoryFields?.find(field => field.label === this.selectedType);
      this.selectedRate = selectedField ? selectedField.rate : 0;
      this.totalRate = this.selectedRate * quantity;
    }
    else {
      this.totalRate = this.selectedRate * quantity;
    }
  }

}