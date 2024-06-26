import { Component, EventEmitter, Inject, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { AddMyExpenseComponent } from '../add-my-expense/add-my-expense.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { attachments } from 'src/app/models/expenses';

@Component({
  selector: 'app-create-expense-report-expenses',
  templateUrl: './create-expense-report-expenses.component.html',
  styleUrl: './create-expense-report-expenses.component.css'
})
export class CreateExpenseReportExpensesComponent {
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
  labelPosition: true | false = true;
  attachments: attachments[] = [];
  selectedFiles: any = [];
  @Input() selectedTab: number;
  user = JSON.parse(localStorage.getItem('currentUser'));

  constructor(public expenseService: ExpensesService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddMyExpenseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean },
    private toast: ToastrService,
    private authService: AuthenticationService) {
    this.expenseReportform = this.fb.group({
      expenseCategory: [''],
      incurredDate: [],
      amount: [0],
      isReimbursable: [''],
      isBillable: [''],
      reason: [''],
      expenseAttachments: [this.attachments],
      expenseReport: ['']
    });
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  ngOnInit() {
    if (this.expenseService.isEdit.getValue() == true) {
      this.expenseService.expenseReportExpense.subscribe(res => {
        this.formValues = res;
        this.expenseReportform.patchValue({
          expenseCategory: res.expenseCategory,
          incurredDate: res.incurredDate,
          amount: res.amount,
          isReimbursable: res.isReimbursable,
          isBillable: res.isBillable,
          reason: res.reason,
          documentLink: res.documentLink,
          expenseReport: res._id
        })
      })
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
  }
  
  ngOnDestroy() {
    this.sharedDataSubscription.unsubscribe();
    this.refreshSubscription.unsubscribe();
  }
  onSubmission() {
    const payload = {
      expenseCategory: this.expenseReportform.value.expenseCategory,
      incurredDate: this.expenseReportform.value.incurredDate,
      amount: this.expenseReportform.value.amountt,
      isReimbursable: this.expenseReportform.value.isReimbursable,
      isBillable: this.expenseReportform.value.isBillable,
      reason: this.expenseReportform.value.reason,
      expenseReport: this.expenseReportform.value.expenseReport,
      expenseTemplateCategoryFieldValues: this.expenseReportform.value.expenseTemplateCategoryFieldValues,
      expenseAttachments: [],
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
          console.log('update: ', payload.expenseAttachments, payload)
          if (payload.expenseAttachments.length >= 1) {
            console.log(payload.expenseAttachments)
          }
          console.log(payload)
          this.expenseService.updateExpenseReportExpenses(expenseReportExpId, payload).subscribe(
            (result: any) => {
              this.expenseService.expenseReportExpense.next(result.data);

              this.toast.success('Expense Report of Expenses is Updated!', 'Successfully!!!');
              this.closeModal();
            },
            (err) => {
              this.toast.error('This expense report of expenses cannot be Updated!', 'Error');
            }
          );
        } else if (this.expenseService.isEdit.getValue() == false) {
          if (this.expenseService.changeMode.getValue() == 'Update') {
            const report = this.expenseService.selectedReport.getValue();
            payload.expenseReport = report._id;
            console.log('add: ', payload);
            this.expenseService.addExpenseReportExpenses(payload).subscribe(
              (result: any) => {
                this.expenseService.expenseReportExpense.next(result.data);
                this.toast.success('Expense Report of Expenses is Created!', 'Successfully!!!');
              },
              (err) => {
                this.toast.error('This expense report of expenses can not be Added!', 'Error');
              }
            );
          }
          else {
            payload.expenseReport = null;
            this.expenseService.expenseReportExpense.next(payload);
            this.closeModal();
          }
        }

      }).catch(error => {
        console.error('Error processing files:', error);
      });
    } else {
      if (this.expenseService.isEdit.getValue() == true) {
        this.expenseService.expenseReportExpense.subscribe(res => {
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
            this.closeModal();
          },
          (err) => {
            this.toast.error('This expense report of expenses cannot be Updated!', 'Error');
          }
        );
      } else if (this.expenseService.isEdit.getValue() == false) {
        const report = this.expenseService.selectedReport.getValue();
        console.log(report);

        if (report._id) {
          payload.expenseReport = report._id;
          this.expenseService.addExpenseReportExpenses(payload).subscribe(
            (result: any) => {
              this.expenseService.expenseReportExpense.next(result.data);
            });
        } else {
          const expenseReportExpense = {
            expenseCategory: this.expenseReportform.value.expenseCategory,
            incurredDate: this.expenseReportform.value.incurredDate,
            expenseTemplateCategoryFieldValues: '',
            quantity: this.expenseReportform.value.quantity,
            type: this.expenseReportform.value.type,
            amount: this.expenseReportform.value.amount,
            isReimbursable: this.expenseReportform.value.isReimbursable,
            isBillable: this.expenseReportform.value.isBillable,
            reason: this.expenseReportform.value.reason,
            expenseAttachments: [],
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
  // onSubmission() {
  //   let payload = {
  //     expenseCategory: this.expenseReportform.value.expenseCategory,
  //     incurredDate: this.expenseReportform.value.incurredDate,
  //     amount: this.expenseReportform.value.amount,
  //     isReimbursable: this.expenseReportform.value.isReimbursable,
  //     isBillable: this.expenseReportform.value.isBillable,
  //     reason: this.expenseReportform.value.reason,
  //     expenseAttachments: [],
  //     expenseReport: this.expenseReportform.value.expenseReport
  //   }
  //   payload.expenseReport = this.expenseService.selectedReport.getValue()._id;
  //   const expenseReportExpenses = this.expenseService.expenseReportExpense.getValue()._id;
  //   if (this.expenseService.isEdit.getValue() == true) {
  //     // update expense report expenses
  //     this.expenseService.updateExpenseReportExpenses(expenseReportExpenses, payload).subscribe((res: any) => {
  //       this.expenseService.expenseReportExpense.next(res.data);
  //       this.toast.success('Expense Report of Expenses is Updated!', 'Successfully!!!')
  //     },
  //       err => {
  //         this.toast.error('This expense report of expenses can not be Updated!', 'Error')
  //       })
  //   }
  //   else if( this.expenseService.isEdit.getValue() == false && this.expenseService.selectedReport.getValue()._id){
  //     // add new expense report expenses  
  //     payload.expenseReport = this.expenseService.selectedReport.getValue()._id;
  //     console.log(payload)
  //     this.expenseService.addExpenseReportExpenses(payload).subscribe((res: any) => {
  //       this.expenseService.expenseReportExpense.next(res.data);
  //       this.toast.success('Expense Report of Expenses is Created!', 'Successfully!!!')
  //     },
  //       err => {
  //         this.toast.error('This expense report of expenses can not be Added!', 'Error')
  //       })
  //   }
  //   else(this.expenseService.isEdit.getValue() == false && !this.expenseService.selectedReport.getValue()._id)
  //   {
  //     console.log('no expense report', payload)
  //     this.expenseService.expenseReportExpense.next(payload);
  //   }

  //   this.expenseService.triggerUpdateTable();
  //   this.dialogRef.close();
  //   this.changeStep.emit(1);
  // }
  closeModal() {
    this.expenseService.triggerUpdateTable();
    this.close.emit(true);
    this.changeStep.emit(1)
  }
  toggleIsReimbursable(event: any) {
    const value = event.value === 'true';
    this.expenseReportform.patchValue({ isReimbursable: value });
    this.expenseReportform.patchValue({ isBillable: !value });
  }
}
