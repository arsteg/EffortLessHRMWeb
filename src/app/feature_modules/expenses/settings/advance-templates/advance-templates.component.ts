import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { Observable, forkJoin } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';

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
  advanceCategories: any = [];
  selectedTemplateId: any;
  advanceCategoriesall: any;
  templates: any[] = [];
  categoryList: any;
  matchingCategories: any;
  noofadvancecat: any;
  users: any;
  public sortOrder: string = '';
  p: number = 1;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

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
      advanceCategories: [[]],
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
    this.getAlladvanceCategories();
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
    this.changeMode == 'Add';
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.addAdvanceTempForm.reset();
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllTemplates();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getAllTemplates();
  }
  getAllTemplates() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.expenseService.getAdvanceTemplates(pagination).subscribe((res: any) => {
      this.list = res.data;
      this.totalRecords = res.total
    })
  }


  getAlladvanceCategories() {
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getAdvanceCatgories(payload).subscribe((res: any) => {
      this.advanceCategoriesall = res.data;
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
    const selectedCategories = this.addAdvanceTempForm.get('advanceCategories').value;
    console.log(selectedCategories.includes(categoryId))
    return selectedCategories.includes(categoryId);
  }



  addAdvanceTemplate() {

    if (this.addAdvanceTempForm.valid) {
      if (this.changeMode === 'Add') {
        let payload = {
          policyLabel: this.addAdvanceTempForm.value['policyLabel'],
          approvalType: this.addAdvanceTempForm.value['approvalType'],
          approvalLevel: this.addAdvanceTempForm.value['approvalLevel'],
          firstApprovalEmployee: this.addAdvanceTempForm.value['firstApprovalEmployee'],
          secondApprovalEmployee: this.addAdvanceTempForm.value['secondApprovalEmployee'],
          advanceCategories: this.addAdvanceTempForm.value.advanceCategories.map(category => ({ advanceCategory: category })),
        };
        this.expenseService.addAdvanceTemplates(payload).subscribe(
          (res: any) => {
            const newCategory = res.data;
            this.list.push(newCategory);

            if (this.advanceCategories.length > 0) {
              let advanceCategories = {
                advanceCategory: newCategory._id
              };
            }
            this.toast.success('New Advance Template Added', 'Successfully!!!');
            this.addAdvanceTempForm.reset();
          },
          err => {
            this.toast.error('Advance template already in use, Try with another Label', 'Error!!!');
          }
        );
        this.addAdvanceTempForm.reset();
      }
      else if (this.changeMode === 'Update') {
        let payload = {
          policyLabel: this.addAdvanceTempForm.value['policyLabel'],
          approvalType: this.addAdvanceTempForm.value['approvalType'],
          approvalLevel: this.addAdvanceTempForm.value['approvalLevel'],
          firstApprovalEmployee: this.addAdvanceTempForm.value['firstApprovalEmployee'],
          secondApprovalEmployee: this.addAdvanceTempForm.value['secondApprovalEmployee'],
          advanceCategories: this.addAdvanceTempForm.value.advanceCategories.map(category => ({ advanceCategory: category })),
        };
        this.expenseService.updateAdvanceTemplates(this.selectedTemplateId, payload).subscribe((res: any) => {
          this.addAdvanceTempForm.reset();
          this.toast.success(' Advance Template Updated', 'Successfully!!!');
          this.isEdit = false;
          this.changeMode == 'Add';
          this.getAllTemplates();
        },
          (err) => {
            this.toast.error('Advance template can not be updated', 'Error')
          });
      }
    }
    else {
      this.markFormGroupTouched(this.addAdvanceTempForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  editadvanceCategory(category, index) {
    this.isEdit = true;
    this.changeMode = 'Update';
    this.expenseService.getAdvanceTemplateById(category?._id).subscribe((res: any) => {
      this.addAdvanceTempForm.patchValue({
        policyLabel: res.data.policyLabel,
        firstApprovalEmployee: res.data.firstApprovalEmployee,
        secondApprovalEmployee: res.data.secondApprovalEmployee,
        approvalType: res.data.approvalType,
        approvalLevel: res.data.approvalLevel,
        advanceCategories: res.data.advanceCategories.map((advanceCategory: any) => advanceCategory.advanceCategory)
      });
      console.log(this.addAdvanceTempForm.value)
    })
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

