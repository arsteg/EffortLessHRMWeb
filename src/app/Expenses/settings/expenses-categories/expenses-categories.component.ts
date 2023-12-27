import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { isEqual } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ExpenseCategory, ExpenseCategoryField } from 'src/app/models/expenses';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
@Component({
  selector: 'app-expenses-categories',
  templateUrl: './expenses-categories.component.html',
  styleUrls: ['./expenses-categories.component.css']
})
export class ExpensesCategoriesComponent implements OnInit {
  searchText: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  closeResult: string = '';
  selectedExpenseType: string = '';
  selectedFieldType: string = '';
  selectedFieldName: string = '';
  categoryFields: any[] = [];
  expenseCategories: any;
  addCategory: ExpenseCategory;
  addCategoryForm: FormGroup;
  fieldType: string = '';
  fieldName: string;
  dropdownOption: any[] = [];
  options: string[] = [];
  newOption: string = '';
  isEdit = false;
  removedFieldId: string = '';

  selectedField: any;
  selectedCategory: any;
  field: any = []
  fname: string;
  ftype: string;
  f: any = [{
    addName: 'user name:',
    type: 'text',
    value: 'First',
    id: 'user'
  }]
  value: any;
  updatedCategory: any;
  originalFields: any[] = [];


  constructor(private modalService: NgbModal,
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

  handleSubmit(event) {
    console.log(event)
  }

  ngOnInit(): void {
    this.getAllExpensesCategories();
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  open(content: any) {

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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
      console.log(this.fields.value[index].id)
      this.expenses.deleteApplicationField(this.fields.value[index].id).subscribe((res: any) => {
        this.fields.removeAt(index);
        this.toast.success('Successfully Deleted!!!', 'Expense Category Field');
      });
    }
    else {
      this.fields.removeAt(index);
    }
  }

  removeFieldValue(fieldIndex: number, valueIndex: number) {
    const fieldArray = this.fields.at(fieldIndex).get('expenseApplicationFieldValues') as FormArray;
    console.log(fieldArray.value[valueIndex]._id)
    this.expenses.deleteApplicationFieldValue(fieldArray.value[valueIndex]._id).subscribe((res: any) => {
      fieldArray.removeAt(valueIndex);
    });
  }

  getAllExpensesCategories() {
    this.expenses.getExpenseCatgories().subscribe((res: any) => {
      this.expenseCategories = res.data;
    })
  }

  onCancel() {
    this.isEdit = false;
    this.addCategoryForm.reset();
  }

  addExpenseCategory() {
    if (this.changeMode === 'Add') {
      let categoryPayload = {
        type: this.addCategoryForm.value['type'],
        label: this.addCategoryForm.value['label'],
        isMandatory: this.addCategoryForm.value['isMandatory']
      };

      this.expenses.addCategory(categoryPayload).subscribe((res: any) => {
        const newCategory = res.data;
        this.expenseCategories.push(newCategory)
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
        this.toast.success('New Expense Category Added', 'Successfully!!!')
      },
        err => {
          this.toast.error('This category is already exist', 'Error!!!')
        });
    }
    else if (this.changeMode === 'Update') {
    }
  }

  deleteCategory(id: string) {
    this.expenses.deleteCategory(id).subscribe((res: any) => {
      this.getAllExpensesCategories();
      this.toast.success('Successfully Deleted!!!', 'Expense Category')
    },
      (err) => {
        this.toast.error('This category is already being used in an expense template!'
          , 'Expense Category, Can not be deleted!')
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
        this.toast.error('Can not be Deleted', 'Error!')
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
    let categoryPayload = {
      type: this.addCategoryForm.value['type'],
      label: this.addCategoryForm.value['label'],
      isMandatory: this.addCategoryForm.value['isMandatory']
    };

    if (
      this.addCategoryForm.get('type').dirty ||
      this.addCategoryForm.get('label').dirty ||
      this.addCategoryForm.get('isMandatory').dirty
    ) {
      this.expenses.updateCategory(this.selectedCategory?._id, categoryPayload).subscribe((res: any) => {
        this.updatedCategory = res.data._id;
      });
    }
    if (this.addCategoryForm.get('fields')) {
      // Check if existing fields have been updated
      const updateFields = (this.addCategoryForm.value['fields'] as any[]).filter(
        (field) => field.id && !this.originalFields.some((originalField) => isEqual(field, originalField))
      );
      console.log(updateFields)
      if (this.addCategoryForm.get('fields').dirty) {
        let fieldsPayload = {
          fields: updateFields
        };
        console.log(fieldsPayload)
        this.expenses.updateCategoryField(fieldsPayload).subscribe((res: any) => {
          console.log(res);
        });
      }
      // Check if new fields have been added
      const newFields = (this.addCategoryForm.value['fields'] as any[]).filter(
        (field) => !field.id && !this.originalFields.some((originalField) => isEqual(field, originalField))
      );
      console.log(newFields);
      if (newFields && newFields.length > 0) {
        let fieldsPayload = {
          fields: newFields,
          expenseCategory: this.selectedCategory._id
        };
        console.log(fieldsPayload);
        this.expenses.addCategoryField(fieldsPayload).subscribe((res: any) => {
          console.log(res);
        });
      }

    }
    this.getAllExpensesCategories();
  }

  editCategory(category, index) {
    this.isEdit = true;
    this.selectedCategory = category;
    console.log(this.selectedCategory)
    this.expenses.getApplicationFieldbyCategory(this.selectedCategory._id).subscribe((res: any) => {
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
      this.addCategoryForm.patchValue({
        type: category.type,
        label: category.label,
        isMandatory: category.isMandatory,
        fields: this.fields.value,
        expenseCategory: this.selectedCategory._id,
      });
      console.log(this.addCategoryForm.value)
    });
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