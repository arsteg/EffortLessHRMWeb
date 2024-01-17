import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { Observable, forkJoin } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-advance-templates',
  templateUrl: './advance-templates.component.html',
  styleUrl: './advance-templates.component.css'
})
export class AdvanceTemplatesComponent implements OnInit {
  searchText: '';
  isEdit = false;
  changeMode: 'Add' | 'Update' = 'Add';
  addAdvanceTempForm: FormGroup;
  closeResult: string = '';
  selectedTemplate: any;
  updatedCategory: any;
  list: any;
  expenseCategories: any = [];
  selectedTemplateId: any;
  expenseCategoriesall: any;
  templates: any[] = [];
  categoryList: any;
  matchingCategories: any;
  noofadvancecat: any;
  users: any;
  public sortOrder: string = '';

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private expenseService: ExpensesService,
    private toast: ToastrService,
    private commonService: CommonService,
    private dialog: MatDialog) {
    this.addAdvanceTempForm = this.fb.group({
      policyLabel: ['', Validators.required],
      approvalType: ['', Validators.required],
      approvalLevel: ['', Validators.required],
      expenseCategories: [[], Validators.required],
      firstApprovalEmployee: ['', Validators.required],
      secondApprovalEmployee: ['', Validators.required]
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


  ngOnInit(): void {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
    this.getAllTemplates();
    this.getAllexpenseCategories();
    this.addAdvanceTempForm.get('approvalLevel').valueChanges.subscribe((value: any) => {
      this.validateApprovers(this.addAdvanceTempForm.get('approvalType').value, value)
    });
    this.addAdvanceTempForm.get('approvalType').valueChanges.subscribe((value: any) => {
      this.validateApprovers(value, this.addAdvanceTempForm.get('approvalLevel').value)
    });
  }

  validateApprovers(approverType, approverLevel) {
    if (approverLevel == 1 && approverType == 'template-wise') {
      this.addAdvanceTempForm.get('firstApprovalEmployee').setValidators([Validators.required]);
      this.addAdvanceTempForm.get('secondApprovalEmployee').clearValidators();
    } else if (approverLevel == 2 && approverType == 'template-wise') {
      this.addAdvanceTempForm.get('firstApprovalEmployee').setValidators([Validators.required]);
      this.addAdvanceTempForm.get('secondApprovalEmployee').setValidators([Validators.required]);
    } else {
      this.addAdvanceTempForm.get('firstApprovalEmployee').clearValidators();
      this.addAdvanceTempForm.get('secondApprovalEmployee').clearValidators();
    }
    this.addAdvanceTempForm.get('firstApprovalEmployee').updateValueAndValidity();
    this.addAdvanceTempForm.get('secondApprovalEmployee').updateValueAndValidity();
  }

  onCancel() {
    this.isEdit = false;
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.addAdvanceTempForm.reset();
  }

  open(content: any) {

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  getAllTemplates() {
    this.expenseService.getAdvanceTemplates().subscribe((res: any) => {
      this.list = res.data;
      console.log(this.list)
    })
  }


  getAllexpenseCategories() {
    this.expenseService.getAdvanceCatgories().subscribe((res: any) => {
      this.expenseCategoriesall = res.data;
    })
  }

  getCategoriesByTemplate(id: string) {
    this.selectedTemplateId = id;
    this.expenseService.getCategoriesByTemplate(id).subscribe((res: any) => {
      this.categoryList = res.data;
      const selectedCategories = this.categoryList.map(category => category.advanceTemplate);
      this.addAdvanceTempForm.get('advanceTemplates').setValue(selectedCategories);
    })
  }
  isSelected(categoryId: string): boolean {
    const selectedCategories = this.addAdvanceTempForm.get('expenseCategories').value;
    console.log(selectedCategories.includes(categoryId))
    return selectedCategories.includes(categoryId);
  }



  addAdvanceTemolate() {
    if (this.changeMode === 'Add') {
      // Use Set to handle unique values in expenseCategories
      let uniqueCategoriesSet = new Set(this.addAdvanceTempForm.value.expenseCategories);

      let categoryPayload = {
        policyLabel: this.addAdvanceTempForm.value['policyLabel'],
        approvalType: this.addAdvanceTempForm.value['approvalType'],
        approvalLevel: this.addAdvanceTempForm.value['approvalLevel'],
        firstApprovalEmployee: this.addAdvanceTempForm.value['firstApprovalEmployee'],
        secondApprovalEmployee: this.addAdvanceTempForm.value['secondApprovalEmployee'],
        expenseCategories: this.addAdvanceTempForm.value.expenseCategories.map(category => ({ expenseCategory: category })),
      };

      this.expenseService.addAdvanceTemplates(categoryPayload).subscribe(
        (res: any) => {
          const newCategory = res.data;
          this.expenseCategories.push(newCategory);

          if (this.expenseCategories.length > 0) {
            let expenseCategories = {
              expenseCategory: newCategory._id
            };
            console.log(expenseCategories);
          }
          this.toast.success('New Advance Template Added', 'Successfully!!!');
        },
        err => {
          this.toast.error('Failed to save the category. Please try again.', 'Error!!!');
        }
      );
    }
  }


  updateAdvanceTemplate() {
    let selectedCategories = this.addAdvanceTempForm.value.expenseCategories.map(expenseCategory => ({ expenseCategory: expenseCategory }));

    // Create an array to hold the observables for each update request
    let updateRequests: Observable<any>[] = [];

    // Iterate over each selected category and create an update request
    selectedCategories.forEach((selectedCategory: any) => {
      let categoryPayload = {
        policyLabel: this.addAdvanceTempForm.value['policyLabel'],
        approvalType: this.addAdvanceTempForm.value['approvalType'],
        approvalLevel: this.addAdvanceTempForm.value['approvalLevel'],
        expenseCategories: [selectedCategory],
      };

      // Add the update request to the array
      updateRequests.push(this.expenseService.updateAdvanceTemplates(this.selectedTemplate?._id, categoryPayload));
    });
    // Use forkJoin to wait for all update requests to complete
    forkJoin(updateRequests).subscribe(
      (responses: any[]) => {
        // Handle the responses as needed for each category update
        responses.forEach((res: any) => {
          console.log(`Category updated: ${res.data._id}`);
        });
        this.getAllTemplates();
        this.toast.success('Advance Template Update', 'Successfully!!!');
      },

      (error) => {
        // Execute this.getAllTemplates() after all updates are completed
        this.getAllTemplates();
        this.toast.success('Advance Template Update', 'Successfully!!!');
      }
    );
  }


  editexpenseCategory(category, index) {
    this.isEdit = true;
    this.selectedTemplate = category;
    console.log(this.selectedTemplate);
    this.addAdvanceTempForm.patchValue({
      policyLabel: category.policyLabel,
      approvalType: category.approvalType,
      approvalLevel: category.approvalLevel,
      expenseCategories: [category.selectedTemplate]
    });
    console.log(this.addAdvanceTempForm.value)
    // this.changesMade=false;
  }

  deleteAdvancecate(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAdvanceTemlate(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }


  deleteAdvanceTemlate(id: string) {
    this.expenseService.deleteAdvanceTemplates(id).subscribe((res: any) => {
      this.getAllTemplates();
      this.toast.success('Successfully Deleted!!!', 'Advance Template')
    },
      (err) => {
        this.toast.error('This category is already being used in an expense template!'
          , 'Advance Category, Can not be deleted!')
      })
  }



}

