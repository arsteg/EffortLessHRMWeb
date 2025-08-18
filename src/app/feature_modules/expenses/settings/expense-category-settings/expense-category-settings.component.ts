import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, Output, EventEmitter, Input, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  private readonly translate = inject(TranslateService);
  allExpenseCategories: any = [];
  isEditable = false;
  @Output() close: any = new EventEmitter();
  @Output() changeStep: any = new EventEmitter();
  @Output() updateExpenseTemplateTable: EventEmitter<void> = new EventEmitter<void>();
  @Input() selectedTemplate: any;
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
  loader = true;
  constructor(private _formBuilder: FormBuilder,
    private expenseService: ExpensesService,
    private toast: ToastrService,
        private dialog: MatDialog
  ) {
    this.minDate.setDate(this.minDate.getDate() - 1);
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }


  ngOnInit() {
    let id = this.expenseService.selectedTemplate.getValue()._id;
    this.expenseService.getCategoriesByTemplate(id).subscribe((res: any) => {
      this.loader = false;
      let applicableCategories = res.data;
      this.expenseCategory = applicableCategories.map(category => { return category.expenseCategory });
      this.expenseService.allExpenseCategories.subscribe((categories: any) => {
        this.allExpenseCategories = categories;
        this.steps = applicableCategories;
        this.firstForm = this._formBuilder.group({
          expenseCategories: this._formBuilder.array([]),
          expenseTemplate: [id]
        });
        const expenseCategoriesArray = this.firstForm.get('expenseCategories') as FormArray;
        this.steps.forEach(async (step: any) => {
          const matchingCategory = this.allExpenseCategories.find(category => category._id === step.expenseCategory._id);
          if (matchingCategory) {
            const categoryId = matchingCategory._id;
            if (categoryId === step.expenseCategory._id) {
              this.typeCategory = matchingCategory.type;
            }
            // Fetch category details by ID
            const categoryDetails = await this.expenseService.getExpenseCategoryById(categoryId).toPromise();
            expenseCategoriesArray.push(this._formBuilder.group({
              expenseCategory: categoryId,
              isMaximumAmountPerExpenseSet: step.isMaximumAmountPerExpenseSet,
              maximumAmountPerExpense: [step.maximumAmountPerExpense, [Validators.min(0)]],
              isMaximumAmountWithoutReceiptSet: step.isMaximumAmountWithoutReceiptSet,
              maximumAmountWithoutReceipt: [step.maximumAmountWithoutReceipt, [Validators.min(0)]],
              maximumExpensesCanApply: [step.maximumExpensesCanApply, [Validators.min(0)]],
              isTimePeroidSet: step.isTimePeroidSet,
              timePeroid: [step.timePeroid, [Validators.min(0)]],
              expiryDay: [step.expiryDay, [Validators.min(0)]],
              isEmployeeCanAddInTotalDirectly: step.isEmployeeCanAddInTotalDirectly,
              ratePerDay: [step.ratePerDay, [Validators.min(0)]],
              expenseTemplateCategoryFieldValues: this._formBuilder.array([], Validators.required),
              categoryType: categoryDetails.data.type,
              _id: step.expenseCategory._id
            }));
            const formGroupIndex = expenseCategoriesArray.length - 1;
            const formGroup = expenseCategoriesArray.at(formGroupIndex);
            if (step.expenseTemplateCategoryFieldValues.length && step.expenseTemplateCategoryFieldValues.length >= 1) {
              const fieldsArray = expenseCategoriesArray.at(formGroupIndex).get('expenseTemplateCategoryFieldValues') as FormArray;
              fieldsArray.clear();
              step.expenseTemplateCategoryFieldValues?.forEach((value) => {
                if (value.expenseTemplateCategory === step._id && categoryDetails.data._id === step.expenseCategory._id) {
                  const fieldFormGroup = this._formBuilder.group({
                    label: value.label,
                    rate: [value.rate, [Validators.min(0)]],
                    type: value.type
                  });
                  fieldsArray.push(fieldFormGroup);
                }
              });
            }
            this.toggleControl(formGroup, 'isMaximumAmountPerExpenseSet', 'maximumAmountPerExpense');
            this.toggleControl(formGroup, 'isMaximumAmountWithoutReceiptSet', 'maximumAmountWithoutReceipt');
            this.toggleControl(formGroup, 'isTimePeroidSet', 'timePeroid');
            this.toggleControl(formGroup, 'isEmployeeCanAddInTotalDirectly', 'expiryDay');
          }
        });
      });
    });
  }

  toggleControl(formGroup, toggler, control){
    if (!formGroup.get(toggler).value) {
      formGroup.get(control).disable();
    }

    formGroup.get(toggler).valueChanges.subscribe((value) => {
      if (value) {
        formGroup.get(control).enable();
      } else {
        formGroup.get(control).disable();
      }
    });
  }

  addField(expenseCategoryIndex: number) {
    const newField = this._formBuilder.group({
      label: ['', Validators.required],
      type: [''],
      rate: ['', Validators.required]
    });
    const expenseCategoriesArray = this.firstForm.get('expenseCategories') as FormArray;
    const expenseCategoryFormGroup = expenseCategoriesArray.at(expenseCategoryIndex) as FormGroup;
    const fieldsArray = expenseCategoryFormGroup.get('expenseTemplateCategoryFieldValues') as FormArray;
    fieldsArray.push(newField);
  }


  get expenseTemplateCategoryFieldValues() {
    return this.firstForm.get('expenseTemplateCategoryFieldValues') as FormArray;
  }

  removeField(expenseCategoryIndex: number, fieldIndex: number) {
    const expenseCategoriesArray = this.firstForm.get('expenseCategories') as FormArray;
    const expenseCategoryFormGroup = expenseCategoriesArray.at(expenseCategoryIndex) as FormGroup;
    const fieldsArray = expenseCategoryFormGroup.get('expenseTemplateCategoryFieldValues') as FormArray;
    if (fieldsArray) {
      fieldsArray.removeAt(fieldIndex);
      this.toast.success(this.translate.instant('expenses.delete_success'));
    } else {
      console.error('FormArray not found');
    }
  }

  deleteCategoryField(i: number, j: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.removeField(i, j);
      }
      err => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'));
      }
    });
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
      this.toast.success(this.translate.instant('expenses.applicable_category_updated_success'));
      this.updateExpenseTemplateTable.emit();
      this.closeModal();
    },
      err => {
        this.toast.error(err || this.translate.instant('expenses.applicable_category_updated_error'));
      })
  }

  closeModal() {
    this.changeStep.emit(1);
    // this.firstForm.reset();
    this.close.emit(true);
  }


}
