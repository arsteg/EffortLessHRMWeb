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
  step = 1;
  categoryLabel: any[];
  steps: any;
  categoriesForm: FormGroup;
  firstForm: any;


  constructor(private _formBuilder: FormBuilder,
    private expenseService: ExpensesService,
    private toast: ToastrService
  ) {

  }


  ngOnInit() {
    this.expenseService.getCategoriesByTemplate(this.expenseService.selectedTemplate.getValue()._id).subscribe((res: any) => {
      let categoryList = res.data;
      console.log(categoryList)
      let expenseCategories = categoryList.map(category => ({ expensecategory: category.expenseCategory }));
      console.log(expenseCategories)
    });

    this.expenseService.allExpenseCategories.subscribe((res: any) => {
      this.allExpenseCategories = res;
      let category = this.expenseService.categories.getValue();
      this.steps = category.expenseCategories;

      this.firstForm = this._formBuilder.group({
        expenseCategories: this._formBuilder.array([]),
        expenseTemplate: [this.expenseService.selectedTemplate.getValue()._id]
      });

      const expenseCategoriesArray = this.firstForm.get('expenseCategories') as FormArray;

      // Add form groups for each category
      this.steps.forEach(step => {
        const matchingCategory = this.allExpenseCategories.find(category => category._id === step.expenseCategory);

        if (matchingCategory) {
          const categoryId = matchingCategory._id;
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
            ratePerDay: 0
          }));
        }
      });

    });
  }
  getCategoryLabel(expenseCategoryId: string): string {
    const matchingCategory = this.allExpenseCategories.find(category => category._id === expenseCategoryId);
    return matchingCategory ? matchingCategory.label : '';
  }

  onSubmit() {
    console.log(this.firstForm.value)
    this.expenseService.addTemplateApplicableCategories(this.firstForm.value).subscribe((res: any) => {
      this.toast.success('Expense Template Applicable Category Updated Successfully!');
      this.changeStep.emit(1);
    },
      err => {
        this.toast.error('Expense Template Applicable Category Can not be Updated', 'ERROR!')
      })
  }

  closeModal() {
    this.changeStep.emit(1);
    this.close.emit(true);
  }

}
