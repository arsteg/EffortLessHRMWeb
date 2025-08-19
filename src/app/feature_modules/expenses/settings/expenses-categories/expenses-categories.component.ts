import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { isEqual } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-expenses-categories',
  templateUrl: './expenses-categories.component.html',
  styleUrls: ['./expenses-categories.component.css']
})
export class ExpensesCategoriesComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  closeResult: string = '';
  expenseCategories = new MatTableDataSource<any>();
  addCategoryForm: FormGroup;
  isEdit = false;
  selectedField: any;
  selectedCategory: any;
  field: any = []
  updatedCategory: any;
  originalFields: any[] = [];
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isSubmitted: boolean = false;
  displayedColumns: string[] = ['label', 'type', 'actions'];
  dialogRef: MatDialogRef<any>;
  expenseTypes = {
    perDay: 'Per Day',
    time: 'Time',
    distance: 'Distance',
    dateRange: 'Date Range',
    other: 'Other'
  }

  constructor(
    private dialog: MatDialog,
    private expenses: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.addCategoryForm = this.fb.group({
      type: ['', Validators.required],
      label: ['', Validators.required],
      isMandatory: ['', Validators.required],
      expenseCategory: [''],
      fields: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.getAllExpensesCategories();
  }

  originalOrder = (a: unknown, b: unknown): number => {
    return 0;
  }

  open(content: any) {
    this.isSubmitted = false;
    this.dialogRef = this.dialog.open(content, {
      width: '50%',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.closeResult = `Closed with: ${result}`;
    });
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.addCategoryForm.reset();
    const fieldsArray = this.addCategoryForm.get('fields') as FormArray;
    while (fieldsArray.length !== 0) {
      fieldsArray.removeAt(0);
    }
  }

  addField(): void {
    const fieldGroup = this.fb.group({
      fieldName: ['', Validators.required],
      fieldType: ['', Validators.required],
      expenseApplicationFieldValues: this.fb.array([]),
    });
    (this.addCategoryForm.get('fields') as FormArray).push(fieldGroup);
  }

  addFieldValue(fieldIndex: number): void {
    const fieldValueGroup = this.fb.group({
      value: ['', Validators.required]
    });
    ((this.addCategoryForm.get('fields') as FormArray).at(fieldIndex).get('expenseApplicationFieldValues') as FormArray).push(fieldValueGroup);
  }

  get fields() {
    return this.addCategoryForm.get('fields') as FormArray;
  }

  removeCatgoryField(index: number) {
    if (this.fields.value[index].id) {
      console.log(this.fields.value[index].id);
      this.expenses.deleteApplicationField(this.fields.value[index].id).subscribe((res: any) => {
        this.fields.removeAt(index);
        this.toast.success(this.translate.instant('expenses.delete_success'));
      });
    }
    else {
      this.fields.removeAt(index);
      this.toast.success(this.translate.instant('expenses.delete_success'));
    }
  }

  deleteApplicationField(index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.removeCatgoryField(index);
      }
      err => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'));
      }
    });

  }
  removeFieldValue(fieldIndex: number, valueIndex: number) {
    const fieldArray = this.fields.at(fieldIndex).get('expenseApplicationFieldValues') as FormArray;
    if (fieldArray.value[valueIndex]._id) {
      console.log(fieldArray.value[valueIndex]._id)
      this.expenses.deleteApplicationFieldValue(fieldArray.value[valueIndex]._id).subscribe((res: any) => {
        fieldArray.removeAt(valueIndex);
      });
    }
    else {
      fieldArray.removeAt(valueIndex);
    }
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getAllExpensesCategories();
  }

  getAllExpensesCategories() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.expenses.getExpenseCatgories(pagination).subscribe((res: any) => {
      this.expenseCategories.data = res.data;
      this.totalRecords = res.total;
    });
  }

  applyFilter(filterValue: any) {
    this.expenseCategories.filter = filterValue.trim().toLowerCase();
  }

  onCancel() {
    if (this.isEdit) {
      this.addCategoryForm.patchValue({

      })
    }
    else if (!this.isEdit) { this.addCategoryForm.reset(); }
    this.dialogRef.close();
  }

  addExpenseCategory() {
    this.isSubmitted = true;
    let categoryPayload = {
      type: this.addCategoryForm.value['type'],
      label: this.addCategoryForm.value['label'],
      isMandatory: this.addCategoryForm.value['isMandatory']
    };

    this.expenses.addCategory(categoryPayload).subscribe((res: any) => {
      const newCategory = res.data;
      this.expenseCategories.data.push(newCategory)
      if (this.addCategoryForm.value['fields'].length > 0) {
        let fieldsPayload = {
          fields: this.addCategoryForm.value['fields'],
          expenseCategory: newCategory._id
        };
        console.log(fieldsPayload)
        this.expenses.addCategoryField(fieldsPayload).subscribe((result: any) => {
          console.log(result.data);
        });
      }
      this.clearselectedRequest();
      this.toast.success(this.translate.instant('expenses.category_added_success'));
      this.dialogRef.close();
      this.getAllExpensesCategories();
    },
      err => {
        this.toast.error(err || this.translate.instant('expenses.category_added_error'));
      });

  }

  deleteCategory(id: string) {
    this.expenses.deleteCategory(id).subscribe((res: any) => {
      this.getAllExpensesCategories();
      this.toast.success(this.translate.instant('expenses.delete_success'));
    },
      (err) => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'));
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteCategory(id);
      }
      err => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'));
      }
    });
  }

  get isAddCategoryFormValid() {
    return this.addCategoryForm.valid;
  }
  initializeFields() {
    this.originalFields = this.addCategoryForm.value['fields'].map((field: any) => ({ ...field }));
  }

  updateExpenseCategory() {
    this.isSubmitted = true;
    let categoryPayload = {
      type: this.addCategoryForm.value['type'],
      label: this.addCategoryForm.value['label'],
      isMandatory: this.addCategoryForm.value['isMandatory']
    };
    /**Update Category */
    const apiCalls = {};
    const updateCategory$ = this.expenses.updateCategory(this.selectedCategory?._id, categoryPayload);
    apiCalls['updateCategory'] = updateCategory$;

    /**Update fields */
    if (this.addCategoryForm.get('fields')) {
      const updateFields = (this.addCategoryForm.value['fields'] as any[]).filter(
        (field) => field.id && !this.originalFields.some((originalField) => isEqual(field, originalField))
      );

      if (updateFields.length > 0) {
        const fieldsPayload = {
          fields: updateFields
        };
        const updateField$ = this.expenses.updateCategoryField(fieldsPayload);
        apiCalls['updateField'] = updateField$;
      }
      /**Add New fields */
      const newFields = (this.addCategoryForm.value['fields'] as any[]).filter(
        (field) => !field.id && !this.originalFields.some((originalField) => isEqual(field, originalField))
      );
      if (newFields && newFields.length > 0) {
        let fieldsPayload = {
          fields: newFields,
          expenseCategory: this.selectedCategory._id
        };
        const addField$ = this.expenses.addCategoryField(fieldsPayload);
        apiCalls['addField'] = addField$;
      }

    }
    forkJoin(apiCalls).subscribe((result: { [key: string]: any }) => {
      if (result['updateCategory']) {
        this.toast.success(this.translate.instant('expenses.category_updated_success'));
        this.updatedCategory = result['updateCategory']?.data._id;
      }
      if (result['updateField']) {
        (this.addCategoryForm.get('fields') as FormArray).clear();
        this.addCategoryForm.reset({
          isMandatory: false
        });
        this.isEdit = false;
        this.toast.success(this.translate.instant('expenses.category_applicable_field_updated_success'));
      }
      if (result['addField']) {
        this.toast.success(this.translate.instant('expenses.category_applicable_field_added_success'))
      }
      this.getAllExpensesCategories();
      this.dialogRef.close();
    })
  }

  editCategory() {
    this.isEdit = true;
    this.expenses.getApplicationFieldbyCategory(this.selectedCategory?._id).subscribe((res: any) => {
      this.field = res.data;
      let fieldData = this.field.map((field) => {
        return {
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          id: field._id,
          expenseCategory: this.selectedCategory._id,
          expenseApplicationFieldValues: field.expenseApplicationFieldValues
        };
      });

      if (fieldData && fieldData.length) {
        this.fields.clear();
        this.selectedField = this.field.map((field) => {
          return {
            _id: field._id
          };
        });
        fieldData.forEach((field) => {
          const fieldGroup = this.fb.group({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            id: field.id,
            expenseCategory: this.selectedCategory._id,
            expenseApplicationFieldValues: this.fb.array([])
          });

          field?.expenseApplicationFieldValues?.forEach((value) => {
            const valueFormGroup = this.fb.group({
              value: value.value,
              _id: value._id
            });
            (fieldGroup.get('expenseApplicationFieldValues') as FormArray).push(valueFormGroup);
          });
          this.fields.push(fieldGroup);
        });

      }
    });
    this.addCategoryForm.patchValue({
      type: this.selectedCategory.type,
      label: this.selectedCategory.label,
      isMandatory: this.selectedCategory.isMandatory,
      fields: this.fields.value,
      expenseCategory: this.selectedCategory._id,
    });
    console.log(this.addCategoryForm.value)
  }

  getFieldType(index: number): string {
    const fieldArray = this.addCategoryForm.get('fields');
    if (fieldArray && fieldArray['controls'] && fieldArray['controls'][index]) {
      const fieldGroup = fieldArray['controls'][index];
      if (fieldGroup && fieldGroup.get('fieldType')) {
        return fieldGroup.get('fieldType').value;
      }
    }
    return '';
  }

}
