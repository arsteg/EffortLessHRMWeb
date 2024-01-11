import { Component, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpensesService } from 'src/app/_services/expenses.service';

@Component({
  selector: 'app-expense-category-settings',
  templateUrl: './expense-category-settings.component.html',
  styleUrl: './expense-category-settings.component.css'
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
  applicableCategoriesForm: FormGroup;

  constructor(private _formBuilder: FormBuilder,
    private expenseService: ExpensesService
  ) {
    this.applicableCategoriesForm = this._formBuilder.group({
      expenseTemplate: ['', Validators.required],
      expenseCategories: this._formBuilder.array([])
    })
  }
  ngOnInit() {
    this.expenseService.allExpenseCategories.subscribe((res: any) => {
      this.allExpenseCategories = res;
      let category = this.expenseService.categories.getValue();
      this.steps = category.expenseCategories;
    });
    this.fetchCategories();
  }
  fetchCategories() {
    const applicableCategories = this.applicableCategoriesForm.get('expenseCategories') as FormArray;
    this.steps.forEach(step => {
      const matchingCategory = this.allExpenseCategories.find(category => category._id === step.expenseCategory);
      const categoryId = matchingCategory._id;
      // const categoryLabel = matchingCategory.label;
      // this.categoryLabel.push(categoryLabel); // Store categoryLabel in an array

      // console.log(this.categoryLabel);
      return {
        ...step,
        label: matchingCategory.label
      };
      applicableCategories.push(
        this._formBuilder.group({
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
        })
      );
    });
    console.log(this.applicableCategoriesForm.value)
  }

  // ngOnInit() {
  //   this.expenseService.allExpenseCategories.subscribe((res: any) => {
  //     this.allExpenseCategories = res;
  //     let category = this.expenseService.categories.getValue();
  //     this.steps = category.expenseCategories;

  //     // Create a single form with a FormArray
  //     this.formGroups = this._formBuilder.group({
  //       expenseCategories: this._formBuilder.array([]),
  //       expenseTemplate: [this.expenseService.selectedTemplate.getValue()._id],
  //     });

  //     // Get the expenseCategories FormArray
  //     const expenseCategoriesArray = this.formGroups.get('expenseCategories') as FormArray;

  //     // Add form groups for each category
  //     this.steps.forEach(step => {
  //       const matchingCategory = this.allExpenseCategories.find(category => category._id === step.expenseCategory);
  //       const categoryId = matchingCategory._id;
  //       this.categoryLabel = matchingCategory.label;
  //       console.log(this.categoryLabel);

  //       expenseCategoriesArray.push(this._formBuilder.group({
  //         expenseCategory: categoryId,
  //         isMaximumAmountPerExpenseSet: false,
  //         maximumAmountPerExpense: 0,
  //         isMaximumAmountWithoutReceiptSet: false,
  //         maximumAmountWithoutReceipt: 0,
  //         maximumExpensesCanApply: 0,
  //         isTimePeroidSet: false,
  //         timePeroid: '10',
  //         expiryDay: 0,
  //         isEmployeeCanAddInTotalDirectly: false,
  //         ratePerDay: 0
  //       }));
  //     });

  //     console.log(this.formGroups.value);
  //   });
  // }



  onSubmit() {
    console.log(this.applicableCategoriesForm);

    this.expenseService.addTemplateApplicableCategories(this.applicableCategoriesForm.value).subscribe((res: any) => {
      console.log(res)
    })
  }


  closeModal() {
    this.close.emit(true);
    this.expenseService.selectedTemplate.next('')
  }
  onChangeStep(event) {
    this.changeStep.emit(1);
    this.close.emit(true);
  }

}
