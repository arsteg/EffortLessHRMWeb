import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';

@Component({
  selector: 'app-expense-category-settings',
  templateUrl: './expense-category-settings.component.html',
  styleUrl: './expense-category-settings.component.css',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ]
})
export class ExpenseCategorySettingsComponent {
  allExpenseCategories: any = [];
  isEditable = false;
  @Output() close: any = new EventEmitter();
  @Output() changeStep: any = new EventEmitter();
  @Output() updateExpenseTemplateTable: EventEmitter<void> = new EventEmitter<void>();
  step = 1;
  categoryLabel: any[];
  steps: any;
  categoriesForm: FormGroup;
  firstForm: any;
  expenseCategory: any[] = [];
  applicationFields: any[] = [];
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  minDate = new Date();
  expenseCategories: any;
  typeCategory: any;
  constructor(private _formBuilder: FormBuilder,
    private expenseService: ExpensesService,
    private toast: ToastrService
  ) {
    this.minDate.setDate(this.minDate.getDate() - 1);
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }


  // ngOnInit() {
  //   let id = this.expenseService.selectedTemplate.getValue()._id;
  //   this.expenseService.getCategoriesByTemplate(id).subscribe((res: any) => {
  //     let categoryList = res.data;
  //     this.expenseCategory = categoryList.map(category => ({ expensecategory: category.expenseCategory }));
  //     this.expenseService.allExpenseCategories.subscribe((res: any) => {
  //       this.allExpenseCategories = res;
  //       this.steps = categoryList;
  //       this.expenseCategories = []; // Array to store matching category types
  //       this.firstForm = this._formBuilder.group({
  //         expenseCategories: this._formBuilder.array([]),
  //         expenseTemplate: [id]
  //       });
  //       const expenseCategoriesArray = this.firstForm.get('expenseCategories') as FormArray;
  //       this.steps.forEach(step => {
  //         const matchingCategory = this.allExpenseCategories.find(category => category._id === step.expenseCategory);
  //         const typeCategory = this.allExpenseCategories.find(category => category.type);
  //         console.log(typeCategory)
  //         if (matchingCategory) {
  //           const categoryId = matchingCategory._id;
  //           this.expenseService.getApplicationFieldbyCategory(categoryId).subscribe((res: any) => {
  //             const applicationFields = res.data;
  //             const fieldsGroup = new FormArray([]);
  //             applicationFields.forEach(field => {
  //               fieldsGroup.push(this._formBuilder.group({
  //                 label: field.fieldName,
  //                 type: field.fieldType,
  //                 rate: 0
  //               }));
  //             });
  //             expenseCategoriesArray.push(this._formBuilder.group({
  //               expenseCategory: categoryId,
  //               isMaximumAmountPerExpenseSet: false,
  //               maximumAmountPerExpense: 0,
  //               isMaximumAmountWithoutReceiptSet: false,
  //               maximumAmountWithoutReceipt: 0,
  //               maximumExpensesCanApply: 0,
  //               isTimePeroidSet: false,
  //               timePeroid: '',
  //               expiryDay: 0,
  //               isEmployeeCanAddInTotalDirectly: false,
  //               ratePerDay: 0,
  //               fields: fieldsGroup,
  //               typecategory: typeCategory
  //             }));
  //             console.log(expenseCategoriesArray.value);
  //             const formGroupIndex = expenseCategoriesArray.length - 1;
  //             expenseCategoriesArray.at(formGroupIndex).patchValue({
  //               isMaximumAmountPerExpenseSet: step.isMaximumAmountPerExpenseSet,
  //               maximumAmountPerExpense: step.maximumAmountPerExpense,
  //               isMaximumAmountWithoutReceiptSet: step.isMaximumAmountWithoutReceiptSet,
  //               maximumAmountWithoutReceipt: step.maximumAmountWithoutReceipt,
  //               maximumExpensesCanApply: step.maximumExpensesCanApply,
  //               isTimePeroidSet: step.isTimePeroidSet,
  //               timePeroid: step.timePeroid,
  //               expiryDay: step.expiryDay,
  //               isEmployeeCanAddInTotalDirectly: step.isEmployeeCanAddInTotalDirectly,
  //               ratePerDay: step.ratePerDay
  //             });
  //           });
  //         }
  //       });
  //     });
  //   });
  // }
  ngOnInit() {
    let id = this.expenseService.selectedTemplate.getValue()._id;
    this.expenseService.getCategoriesByTemplate(id).subscribe((res: any) => {
      let categoryList = res.data;
      this.expenseCategory = categoryList.map(category => ({ expensecategory: category.expenseCategory }));
      this.expenseService.allExpenseCategories.subscribe((res: any) => {
        this.allExpenseCategories = res;
        this.steps = categoryList;
        this.firstForm = this._formBuilder.group({
          expenseCategories: this._formBuilder.array([]),
          expenseTemplate: [id]
        });
        const expenseCategoriesArray = this.firstForm.get('expenseCategories') as FormArray;
        this.steps.forEach(step => {
          const matchingCategory = this.allExpenseCategories.find(category => category._id === step.expenseCategory);
          console.log(step);
          console.log(matchingCategory)
          if (matchingCategory) {
            const categoryId = matchingCategory._id;
            this.expenseService.getApplicationFieldbyCategory(categoryId).subscribe((res: any) => {
              const applicationFields = res.data;
              const fieldsGroup = new FormArray([]);
              applicationFields.forEach(field => {
                fieldsGroup.push(this._formBuilder.group({
                  label: field.fieldName,
                  type: field.fieldType,
                  rate: 0
                }));
              });
              // if (categoryId == matchingCategory?._id) {
              //   this.typeCategory = matchingCategory.type;
              //   console.log(this.typeCategory);
              // }
              if (matchingCategory._id === step.expenseCategory) {
                this.typeCategory = matchingCategory.type;
                console.log(matchingCategory.expenseCategory, categoryList.expenseCategory, this.typeCategory);
              }
              expenseCategoriesArray.push(this._formBuilder.group({
                expenseCategory: categoryId,
                isMaximumAmountPerExpenseSet: false,
                maximumAmountPerExpense: 0,
                isMaximumAmountWithoutReceiptSet: false,
                maximumAmountWithoutReceipt: 0,
                maximumExpensesCanApply: 0,
                isTimePeroidSet: false,
                timePeroid: '',
                expiryDay: 0,
                isEmployeeCanAddInTotalDirectly: false,
                ratePerDay: 0,
                fields: fieldsGroup,
                categoryType: this.typeCategory
              }));
              console.log(expenseCategoriesArray.value);
              const formGroupIndex = expenseCategoriesArray.length - 1;
              expenseCategoriesArray.at(formGroupIndex).patchValue({
                isMaximumAmountPerExpenseSet: step.isMaximumAmountPerExpenseSet,
                maximumAmountPerExpense: step.maximumAmountPerExpense,
                isMaximumAmountWithoutReceiptSet: step.isMaximumAmountWithoutReceiptSet,
                maximumAmountWithoutReceipt: step.maximumAmountWithoutReceipt,
                maximumExpensesCanApply: step.maximumExpensesCanApply,
                isTimePeroidSet: step.isTimePeroidSet,
                timePeroid: step.timePeroid,
                expiryDay: step.expiryDay,
                isEmployeeCanAddInTotalDirectly: step.isEmployeeCanAddInTotalDirectly,
                ratePerDay: step.ratePerDay
              });
            });
          }
        });
      });
    });
  }

  matchingCategory(expenseCategory: any, currentCategoryIndex: number): boolean {
    // Check if the expense category matches the current iteration's category index
    return this.expenseCategory[currentCategoryIndex]?.expensecategory === expenseCategory;
  }


  getCategoryLabel(expenseCategoryId: string): string {
    const matchingCategory = this.allExpenseCategories.find(category => category._id === expenseCategoryId);
    return matchingCategory ? matchingCategory.label : '';
  }

  onSubmit() {
    this.expenseService.addTemplateApplicableCategories(this.firstForm.value).subscribe((res: any) => {
      this.toast.success('Expense Template Applicable Category Updated Successfully!');
      this.updateExpenseTemplateTable.emit();
      this.closeModal();
    },
      err => {
        this.toast.error('Expense Template Applicable Category Can not be Updated', 'ERROR!');
      })
  }

  closeModal() {
    this.changeStep.emit(1);
    this.firstForm.reset();
    this.close.emit(true);
  }

  addField(): void {
    const fieldGroup = this._formBuilder.group({
      label: ['', Validators.required],
      type: ['', Validators.required],
      rate: [0],
    });

    (this.firstForm.get('fields') as FormArray).push(fieldGroup);
  }

  removeCatgoryField(index: number) {
    if (this.fields.value[index].id) {
      console.log(this.fields.value[index].id);
      this.fields.removeAt(index);

      // this.expenses.deleteApplicationField(this.fields.value[index].id).subscribe((res: any) => {
      //   this.fields.removeAt(index);
      //   this.toast.success('Successfully Deleted!!!', 'Expense Category Field');
      // });
    }
    else {
      this.fields.removeAt(index);
    }
  }

  get fields() {
    return this.firstForm.get('fields') as FormArray;
  }


}
