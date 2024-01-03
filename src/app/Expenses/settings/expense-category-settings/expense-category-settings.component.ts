import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpensesService } from 'src/app/_services/expenses.service';

@Component({
  selector: 'app-expense-category-settings',
  templateUrl: './expense-category-settings.component.html',
  styleUrl: './expense-category-settings.component.css'
})
export class ExpenseCategorySettingsComponent {
  allExpenseCategories: any = [];
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isEditable = false;
  @Output() close: any = new EventEmitter();
  @Output() changeStep: any = new EventEmitter();
  step = 1;
  // steps = [
  //   { label: 'Fill out your name', formGroupName: 'firstFormGroup', controlName: 'firstCtrl', placeholder: 'Last name, First name', required: true },
  //   { label: 'Fill out your address', formGroupName: 'secondFormGroup', controlName: 'secondCtrl', placeholder: 'Ex. 1 Main St, New York, NY', required: true },
  //   { label: 'Done', customContent: true },
  // ];
  steps: any;
  categoriesForm: FormGroup;
  formGroups: FormGroup;

  constructor(private _formBuilder: FormBuilder,
    private expenseService: ExpensesService
  ) {

  }

  ngOnInit() {
    this.expenseService.allExpenseCategories.subscribe((res: any) => {
      this.allExpenseCategories = res;
      console.log(this.allExpenseCategories)
      let selectedTemplate = this.expenseService.selectedTemplate.getValue();
      this.steps = selectedTemplate.matchingCategories;
      console.log(this.steps)
      this.formGroups = this.steps.map(step => {
        const matchingCategory = this.allExpenseCategories.find(category => category._id === step.expenseCategory);
        const label = matchingCategory.label;

        return this._formBuilder.group({
          [step.controlName]: [step.initialValue || '', step.required ? Validators.required : null],
          label: [label],
        });
      });
      console.log(this.formGroups.value)
    });
  }
 
 


  // ngOnInit() {
  //   this.expenseService.allExpenseCategories.subscribe((res: any) => {
  //     this.allExpenseCategories = res;
  //     console.log(this.allExpenseCategories);
  //     let selectedTemplate = this.expenseService.selectedTemplate.getValue();
  //     this.steps = selectedTemplate.matchingCategories;
  //     console.log(this.steps);

  //     // Initialize categoriesForm
  //     this.categoriesForm = this._formBuilder.group({
  //       isMaximumAmountPerExpenseSet: [false],
  //       maximumAmountPerExpense: [],
  //       isMaximumAmountWithoutReceiptSet: [false],
  //       maximumAmountWithoutReceipt: [0],
  //       maximumExpensesCanApply: [0],

  //       isTimePeroidSet: [false],
  //       timePeroid: [''],
  //       expiryDay: [0],
  //       isEmployeeCanAddInTotalDirectly: [false],
  //       ratePerDay: [0]
  //     });

  //     // Create formGroups array for stepper
  //     this.formGroups = [this.categoriesForm, ...this.steps.map(step => {
  //       const matchingCategory = this.allExpenseCategories.find(category => category._id === step.expenseCategory);
  //       const label = matchingCategory.label;

  //       return this._formBuilder.group({
  //         [step.controlName]: [step.initialValue || '', step.required ? Validators.required : null],
  //         label: [label],
  //       });
  //     })];
  //     console.log(this.formGroups)
  //   });
  // }

  closeModal() {
    this.close.emit(true);
    this.expenseService.selectedTemplate.next('')
  }
  onChangeStep(event) {
    this.changeStep.emit(1);
    this.close.emit(true);
  }

}
