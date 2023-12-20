import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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


  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private expenses: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.addCategoryForm = this.fb.group({
      type: ['', Validators.required],
      label: ['', Validators.required],
      expenseCategory: [''],
      fields: this.fb.array([]),
      expenseApplicationField: [''],
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

  }

  addField(): void {
    const fieldGroup = this.fb.group({
      fieldName: ['', Validators.required],
      fieldType: ['', Validators.required],
      isMandatory: [false, Validators.required],
      fieldvalues: this.fb.array([]),
    });

    (this.addCategoryForm.get('fields') as FormArray).push(fieldGroup);
  }

  addFieldValue(fieldIndex: number): void {
    const fieldValueGroup = this.fb.group({
      value: ['', Validators.required],
    });
    ((this.addCategoryForm.get('fields') as FormArray).at(fieldIndex).get('fieldvalues') as FormArray).push(fieldValueGroup);
  }

  get fields() {
    return this.addCategoryForm.get('fields') as FormArray;
  }
  get values() {
    return this.addCategoryForm.get('fieldValue') as FormArray;
  }

  // addCategoryField() {
  //   this.fields.push(this.fb.group({
  //     fieldName: '',
  //     fieldType: '',
  //     isMandatory: null,
  //     id: '',
  //     expenseCategory: '',
  //     fieldvalues: ['']
  //   }));
  // }
  // addFieldValue() {
  //   this.values.push(this.fb.group({
  //     name: '',
  //     type: '',
  //     value: ''
  //   }))
  // }

  removeCatgoryField(index: number) {

    // this.expenses.deleteApplicationField(this.fields.value[index].id).subscribe((res: any) => {
    //   this.fields.removeAt(index);
    //   this.toast.success('Successfully Deleted!!!', 'Expense Category Field');
    // });
  }

  removeFieldValue(index: number) {
    const deletedValue = this.values.value[index].id;
    this.values.removeAt(index);
    this.expenses.deleteApplicationFieldValue(deletedValue).subscribe((res) => {
      this.toast.success('Successfully Deleted!!!', 'Expense Category Field Value');
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
        label: this.addCategoryForm.value['label']
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

        this.isEdit = false;
        this.addCategoryForm.reset();
      });
    }
    else if (this.changeMode === 'Update') {
      // Handle the update case if needed
    }
  }


  // addExpenseCategory() {
  //   if (this.changeMode === 'Add') {
  //     let categoryPayload = {
  //       type: this.addCategoryForm.value['type'],
  //       label: this.addCategoryForm.value['label']
  //     };

  //     this.expenses.addCategory(categoryPayload).pipe(
  //       switchMap((categoryResponse: any) => {
  //         const newCategory = categoryResponse.data;
  //         this.expenseCategories.push(newCategory);
  //         if (this.addCategoryForm.value['fields'].length > 0) {
  //           let fieldsPayload = {
  //             fields: this.addCategoryForm.value['fields'],
  //             expenseCategory: newCategory._id
  //           };

  //           console.log(fieldsPayload);
  //           return this.expenses.addCategoryField(fieldsPayload);
  //         } else {
  //           return of(null);
  //         }
  //       }),
  //       switchMap((fieldsResponse: any) => {
  //         if (fieldsResponse) {
  //           const response = fieldsResponse.data;
  //           const fieldObservables = response.map((field) => {
  //             if (field.fieldType === 'Dropdown' && this.addCategoryForm.value['fieldValue'].length > 0) {
  //               let fieldOptionsPayload = {
  //                 expenseApplicationField: field._id,
  //                 fieldValue: this.addCategoryForm.value['fieldValue'].map((valueObject: any) => {
  //                   return {
  //                     name: field.fieldName,
  //                     type: field.fieldType,
  //                     value: valueObject.value
  //                   };
  //                 })
  //               };

  //               console.log(fieldOptionsPayload);
  //               return this.expenses.addApplicationFieldValue(fieldOptionsPayload);
  //             } else {
  //               return of(null); // No field options to add
  //             }
  //           });

  //           return forkJoin(fieldObservables);
  //         } else {
  //           return of(null); // No fields added, no need to add options
  //         }
  //       })
  //     ).subscribe((results: any) => {
  //       // Handle results if needed
  //       console.log('Results:', results);

  //       this.isEdit = false;
  //       this.addCategoryForm.reset();
  //     });
  //   } else if (this.changeMode === 'Update') {
  //     // Handle the update case if needed
  //   }
  // }


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

  updateExpenseCategory() {
    let categoryPayload = {
      type: this.addCategoryForm.value['type'],
      label: this.addCategoryForm.value['label'],
    };
    this.expenses.updateCategory(this.selectedCategory?._id, categoryPayload).subscribe((res: any) => {
      this.updatedCategory = res.data._id;
    });
    // Update application field
    if (this.addCategoryForm.get('fields')) {
      let fieldsPayload = {
        fields: this.fields.value
      };
      this.expenses.updateCategoryField(fieldsPayload).subscribe((res: any) => {
        console.log(res);
      });
    }
    // Update application field Value
    if (this.addCategoryForm.value['fieldValue'].length > 0) {
      let fieldValuePayload = {
        fields: this.addCategoryForm.value['fieldValue']
      };
      this.expenses.updateApplicationFieldValue(fieldValuePayload).subscribe((res: any) => {
        console.log(res)
      })
    }
    // if new field added
    const newField = this.addCategoryForm.value['fields'].filter((field: any) => !field._id);
    if (newField.length > 0) {
      let fieldsPayload = {
        fields: newField,
        expenseCategory: this.selectedCategory._id
      };
      console.log('new Fields: ', fieldsPayload)
      this.expenses.addCategoryField(fieldsPayload).subscribe((result: any) => {
        console.log('New fields added during update:', result.data);
      });
    }
    // Add new field values if any
    const newFieldValues = this.addCategoryForm.value['fieldValue'].filter((fieldValue: any) => !fieldValue._id);
    if (newFieldValues.length > 0) {
      let fieldOptionsPayload = {
        expenseApplicationField: this.addCategoryForm.value['fields'].id,  // You need to provide the correct field ID here
        fieldValue: newFieldValues
      };
      console.log('New field values added:', fieldOptionsPayload);
      this.expenses.addApplicationFieldValue(fieldOptionsPayload).subscribe((res: any) => {
        console.log('New field values added:', res);
      });
    }
    this.getAllExpensesCategories();
    // this.isEdit = false;
  }

  editCategory(category, index) {
    this.isEdit = true;
    this.selectedCategory = category;
    console.log(this.selectedCategory);

    this.expenses.getApplicationFieldbyCategory(this.selectedCategory._id).subscribe((res: any) => {
      this.field = res.data;
      console.log(this.field)
      let fieldData = this.field.map((field) => {
        return {
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          isMandatory: field.isMandatory,
          id: field._id,
          expenseCategory: this.selectedCategory._id
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
          console.log(field)
          this.fields.push(this.fb.group({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            isMandatory: field.isMandatory,
            id: field.id,
            expenseCategory: this.selectedCategory._id,
            fieldvalues: field.fieldvalues[0].value
          }));
        });

        this.expenses.getApplicationFieldValuebyFieldId(this.selectedField[0]._id).subscribe((res: any) => {
          const mappedValues = res.data.map((Value) => {
            return {
              value: Value.value,
              name: Value.name,
              type: Value.type,
              id: Value._id,
              expenseApplicationField: Value.expenseApplicationField
            };
          });
          const fieldValueArray = this.addCategoryForm.get('fieldValue') as FormArray;
          fieldValueArray.clear();
          mappedValues.forEach((fieldValue) => {
            fieldValueArray.push(this.fb.group({
              name: fieldValue.name,
              type: fieldValue.type,
              value: fieldValue.value,
              id: fieldValue.id,
              expenseApplicationField: fieldValue.expenseApplicationField
            }));
          });
          this.addCategoryForm.patchValue({
            type: category.type,
            label: category.label,
            fields: this.fields.value,
            expenseCategory: this.selectedCategory._id,
            expenseApplicationField: this.selectedField[0]._id,
          });
          console.log(this.addCategoryForm.value)
        });
      }
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