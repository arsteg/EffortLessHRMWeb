import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
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
      Name: [''],
      Type: [''],
      Value: ['']
    });
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

  get fields() {
    return this.addCategoryForm.get('fields') as FormArray;
  }

  addCategoryField() {
    this.fields.push(this.fb.group({
      fieldName: '',
      fieldType: '',
      isMandatory: null
    }));
  }

  removeCatgoryField(index: number) {
    // if (index >= 0 && index < this.categoryFields.length) {
    //   const removedField = this.categoryFields[index];
    //   this.categoryFields.splice(index, 1);
    //   this.expenses.deleteApplicationField(removedField.value._id).subscribe(
    //     (res) => {
    //       this.toast.success('Successfully Deleted!!!', 'Expense Field');
    //     },
    //     (err) => {
    //       this.toast.error('Cannot be Deleted', 'Error!');
    //     }
    //   );
    // }

    this.fields.removeAt(index);

  }



  addOption() {
    this.addCategoryForm.patchValue({
      expenseApplicationField: '',
      Name: '',
      Type: '',
      Value: ''
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
    let categoryPayload = {
      type: this.addCategoryForm.value['type'],
      label: this.addCategoryForm.value['label'],
    }
    this.expenses.addCategory(categoryPayload).subscribe((res: any) => {
      this.expenseCategories = res.data;
      // add category Field
      this.addCategoryForm.value.expenseCategory = this.expenseCategories._id;
      if (this.addCategoryForm.value['fields'].length > 0) {
        let fieldsPayload = {
          fields: this.addCategoryForm.value['fields'],
          expenseCategory: this.expenseCategories._id
        }
        this.expenses.addCategoryField(fieldsPayload).subscribe((result: any) => {
          const response = result.data;
          response.forEach((field) => {

            // add application field options
            if (field.fieldType === 'Dropdown') {
              let fieldOptionsPayload = {
                expenseApplicationField: field._id,
                Name: field.fieldName,
                Type: field.fieldType,
                Value: this.addCategoryForm.value['Value']
              }
              console.log(fieldOptionsPayload)
              this.expenses.addApplicationFieldValue(fieldOptionsPayload).subscribe((res: any) => {
                console.log('Application Field added:', res);
              });
            }
          });
        });
        this.isEdit = false;
        this.addCategoryForm.reset();
      }
    })
  }

  deleteCategory(id: string) {
    this.expenses.deleteCategory(id).subscribe((res: any) => {
      this.getAllExpensesCategories();
      this.toast.success('Successfully Deleted!!!', 'Expense Category')
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

  // updateExpenseCategory() {
  //   let categoryPayload = {
  //     type: this.addCategoryForm.value['type'],
  //     label: this.addCategoryForm.value['label'],
  //   }
  //   this.expenses.updateCategory(this.selectedCategory?._id, categoryPayload).subscribe((res: any) => {
  //     const categoryId = res.data._id;

  //     // update application field
  //     if (this.addCategoryForm.value['fields'].length > 0) {
  //       let fieldsPayload = {
  //         fields: this.addCategoryForm.value['fields'],
  //         expenseCategory: categoryId
  //       }
  //       const fieldId = this.field[0]._id;
  //       console.log(fieldId, this.addCategoryForm.value['fields'])
  //       // this.expenses.updateCategoryField(fieldId, fieldsPayload).subscribe((res: any) => {
  //       //   console.log(res)
  //       // })

  //     }
  //   });

  //   this.addCategoryForm.reset();
  //   this.isEdit = false;
  // }
  // editCategory(category, index) {
  //   this.isEdit = true;
  //   this.selectedCategory = category;
  //   this.expenses.getApplicationFieldbyCategory(this.selectedCategory._id).subscribe(
  //     (res: any) => {
  //       this.field = res.data;
  //       let fieldData = this.field.map((field) => {
  //         return {
  //           fieldName: field.fieldName,
  //           fieldType: field.fieldType,
  //           isMandatory: field.isMandatory
  //         }
  //       })
  //       if (fieldData && fieldData.length) {
  //         fieldData.forEach((field) => {
  //           this.fields.push(this.fb.group({
  //             fieldName: field.fieldName,
  //             fieldType: field.fieldType,
  //             isMandatory: field.isMandatory
  //           }));


  //         })

  //         this.selectedField = this.field.map((field) => {
  //           return {
  //             _id: field._id
  //           }
  //         })
  //       }
  //       this.addCategoryForm.patchValue({
  //         type: category.type,
  //         label: category.label,
  //         fields: this.fields.value,
  //         expenseCategory: this.selectedCategory._id,
  //         expenseApplicationField: this.selectedField || null
  //       });
  //       console.log(this.addCategoryForm.value);
  //     }
  //   );

  // } 



  editCategory(category, index) {
    this.isEdit = true;
    this.selectedCategory = category;
    this.expenses.getApplicationFieldbyCategory(this.selectedCategory._id).subscribe(
      (res: any) => {
        this.field = res.data;
        let fieldData = this.field.map((field) => {
          return {
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            isMandatory: field.isMandatory
          };
        });

        if (fieldData && fieldData.length) {
          fieldData.forEach((field) => {
            this.fields.push(this.fb.group({
              fieldName: field.fieldName,
              fieldType: field.fieldType,
              isMandatory: field.isMandatory
            }));
          });

          this.selectedField = this.field.map((field) => {
            return {
              _id: field._id
            };
          });
        }

        this.addCategoryForm.patchValue({
          type: category.type,
          label: category.label,
          fields: this.fields.value,
          expenseCategory: this.selectedCategory._id,
          expenseApplicationField: this.selectedField || null
        });
        console.log(this.addCategoryForm.value);
      }
    );
  }

  updateExpenseCategory() {
    this.expenses.getApplicationFieldbyCategory(this.selectedCategory._id).pipe(
      switchMap((res: any) => {
        this.field = res.data;
        console.log(this.fields.value);
        if (this.addCategoryForm.value['fields'].length > 0) {
          let fieldsPayload = {
            fields: this.addCategoryForm.value['fields'],
            expenseCategory: this.selectedCategory._id
          };
          const fieldId = this.field[0]._id;
          console.log(fieldId, this.addCategoryForm.value);
          return this.expenses.updateCategoryField(fieldId, fieldsPayload);
        } else {
          return of(null); // Return a dummy observable if no fields to update
        }
      })
    ).subscribe((res: any) => {
      console.log(res);
    });

    let categoryPayload = {
      type: this.addCategoryForm.value['type'],
      label: this.addCategoryForm.value['label'],
    };

    this.expenses.updateCategory(this.selectedCategory?._id, categoryPayload).subscribe((res: any) => {
      const categoryId = res.data._id;
    });

    this.addCategoryForm.reset();
    this.isEdit = false;
  }


}