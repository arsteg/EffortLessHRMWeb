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
  fieldTemplates = {
    distance: [
      { label: 'Label', placeholder: 'Enter Label', formControlName: 'label' },
      { label: 'Type', placeholder: 'Select Distance in -', formControlName: 'type', type: 'select', options: ['KM', 'Miles'] },
      { label: 'Rate', placeholder: 'Enter Rate', formControlName: 'rate', type: 'number' }
    ],
    perDay: [
      { label: 'Label', placeholder: 'Enter Label', formControlName: 'label' },
      { label: 'Rate', placeholder: 'Rate per Day', formControlName: 'rate', type: 'number' }
    ],
    other: [],
    dateRange: [],
    time: [
      { label: 'Label', placeholder: 'Enter Label', formControlName: 'label' },
      { label: 'Rate', placeholder: 'Rate per Hour', formControlName: 'rate', type: 'number' }
    ]
  }
  constructor(private _formBuilder: FormBuilder,
    private expenseService: ExpensesService,
    private toast: ToastrService
  ) {
    this.minDate.setDate(this.minDate.getDate() - 1);
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];

    // this.firstForm = this._formBuilder.group({
    //   fields: this._formBuilder.array([])
    // });
    // console.log(this.firstForm.value.fields)
  }


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
        this.steps.forEach(async (step) => {
          const matchingCategory = this.allExpenseCategories.find(category => category._id === step.expenseCategory);
          if (matchingCategory) {
            const categoryId = matchingCategory._id;

            if (matchingCategory._id === step.expenseCategory) {
              this.typeCategory = matchingCategory.type;
            }
            // Fetch category details by ID
            const categoryDetails = await this.expenseService.getExpenseCategoryById(categoryId).toPromise();

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
              expenseTemplateCategoryFieldValues: this._formBuilder.array([]),
              categoryType: categoryDetails.data.type,
              _id: ''
            }));
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
              ratePerDay: step.ratePerDay,
              expenseTemplateCategoryFieldValues: [],
              categoryType: categoryDetails.data.type,
              _id: step._id
            });

            if (step.expenseTemplateCategoryFieldValues.length && step.expenseTemplateCategoryFieldValues.length >= 1) {
              step.expenseTemplateCategoryFieldValues?.forEach((value) => {
                if (value.expenseTemplateCategory === step._id && categoryDetails.data._id === step.expenseCategory) { 
                  const fieldFormGroup = this._formBuilder.group({
                    label: value.label,
                    rate: value.rate,
                    type: value.type
                  });
                  const fieldsArray = (expenseCategoriesArray.at(formGroupIndex).get('expenseTemplateCategoryFieldValues') as FormArray);
                  fieldsArray.push(fieldFormGroup);
                }
              });
            }
            
          }
        });
      });
    });
  }

  addField(expenseCategoryIndex: number) {
    const newField = this._formBuilder.group({
      label: [''],
      type: [''],
      rate: []
    });
    const expenseCategoriesArray = this.firstForm.get('expenseCategories') as FormArray;
    const expenseCategoryFormGroup = expenseCategoriesArray.at(expenseCategoryIndex) as FormGroup;
    const fieldsArray = expenseCategoryFormGroup.get('expenseTemplateCategoryFieldValues') as FormArray;
    fieldsArray.push(newField);
  }


  get expenseTemplateCategoryFieldValues() {
    return this.firstForm.get('expenseTemplateCategoryFieldValues') as FormArray;
  }

  removeField(fieldsArray: FormArray, index: number) {
    fieldsArray.removeAt(index);
  }


  getCategoryLabel(expenseCategoryId: string): string {
    const matchingCategory = this.allExpenseCategories.find(category => category._id === expenseCategoryId);
    return matchingCategory ? matchingCategory.label : '';
  }

  onSubmit() {
    const formData = { ...this.firstForm.value };
    formData.expenseCategories.forEach((category: any) => {
      delete category.categoryType;
    });
    this.expenseService.addTemplateApplicableCategories(formData).subscribe((res: any) => {
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
    // this.firstForm.reset();
    this.close.emit(true);
  }


}
