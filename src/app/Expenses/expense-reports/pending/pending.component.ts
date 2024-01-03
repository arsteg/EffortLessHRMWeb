import { Component } from '@angular/core';
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
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingComponent {
[x: string]: any;
  searchText: string = '';
  expenseCategories: any;
  isEdit = false;
  addCategoryForm: FormGroup;
  closeResult: string = '';

  
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
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  onCancel() {
    this.isEdit = false;
    this.addCategoryForm.reset();
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
}
