import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
@Component({
  selector: 'app-expenses-templates',
  templateUrl: './expenses-templates.component.html',
  styleUrls: ['./expenses-templates.component.css'],
})
export class ExpensesTemplatesComponent implements OnInit {
  searchText: string = '';
  changeMode: 'Add' | 'Next' = 'Add';
  closeResult: string = '';
  templates: any[] = [];
  expenseCategories: any;
  addTemplateForm: FormGroup;
  p: number = 1;
  selectedTemplateId: any;
  formatValues: string;
  filteredTemplates: any[] = [];
  categoryList: any;
  selectedCategory: any;
  matchingCategories: any;
  users: any;
  step: number = 1;
  public sortOrder: string = '';
  @Output() expenseTemplateTableRefreshed: EventEmitter<void> = new EventEmitter<void>();
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(
    private modalService: NgbModal,
    private config: NgbModalConfig,

    private dialog: MatDialog,
    private expenseService: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService,
    public commonService: CommonService) {
    config.backdrop = 'static';
  }

  ngOnInit(): void {
    this.getAllTemplates();
    this.filteredTemplate();
  }

  clearForm(){
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
      // this.addTemplateForm.reset();
    }
  }

  onChangeStep(event) {
    this.step = event;
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

  setFormValues(templateData: any) {
    this.expenseService.selectedTemplate.next(templateData);
  }

  deleteTemplate(_id: string) {
    this.expenseService.deleteTemplate(_id).subscribe((res: any) => {
      const index = this.templates.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.templates.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Expense Template')
    },
      (err) => {
        this.toast.error('This Template is already being used!'
          , 'Expense template, Can not be deleted!')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
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
    this.expenseService.getAllTemplates(pagination).subscribe((res: any) => {
      this.templates = res.data;
      this.totalRecords = res.total;
      this.getAllCategoriesOfAllTemplate()
    })
  }

  get downloadableFormatsArray() {
    return this.addTemplateForm.get('downloadableFormats') as FormArray;
  }

  get categoriesArray() {
    return this.addTemplateForm.get('selectedCategories') as FormArray;
  }

  createTemplate() {
    let payload = {
      policyLabel: this.addTemplateForm.value.policyLabel,
      approvalType: this.addTemplateForm.value.approvalType,
      applyforSameCategorySamedate: this.addTemplateForm.value.applyforSameCategorySamedate,
      advanceAmount: this.addTemplateForm.value.advanceAmount,
      firstApprovalEmployee: this.addTemplateForm.value.firstApprovalEmployee,
      secondApprovalEmployee: this.addTemplateForm.value.secondApprovalEmployee,
      expenseTemplate: this.addTemplateForm.value.expenseTemplate,
      expenseCategories: this.addTemplateForm.value.expenseCategories,
    }
    if (this.changeMode === 'Add') {
      this.expenseService.addTemplate(payload).subscribe((res: any) => {
        const newTemplate = res.data;
        this.templates.push(newTemplate);
        const templateId = newTemplate._id;
        this.categoriesAddOrUpdate(templateId, payload.expenseCategories);
        this.toast.success('New Template Created Successfully!');
        this.addTemplateForm.reset();
      }, err => {
        this.toast.error('Template Can not be Added', 'ERROR!')
      }
      );
    } else {
      const existingFormats = this.formatValues
      const updatedFormats = this.addTemplateForm.value.downloadableFormats;
      this.expenseService.updateTemplate(this.selectedTemplateId, payload).subscribe((res: any) => {
        const updatedTemplate = res.data;
        const index = this.templates.findIndex(template => template._id === updatedTemplate._id);
        if (index !== -1) {
          this.templates[index] = updatedTemplate;
        }
        this.categoriesAddOrUpdate(this.selectedTemplateId, payload.expenseCategories);
        this.addTemplateForm.reset();
        this.toast.success('Template Updated Successfully!');
      }, err => {
        this.toast.error('Template Can not be Updated', 'ERROR!')
      })
    }
  }


  combineFormats(existingFormats, updatedFormats) {
    const combinedFormats = existingFormats.filter(format => updatedFormats.includes(format));
    updatedFormats.forEach(format => {
      if (!existingFormats.includes(format)) {
        combinedFormats.push(format);
      }
    });
    return combinedFormats;
  }

  updateTemplate(templateId: any) {
    this.selectedTemplateId = templateId;
    this.changeMode = 'Next';
    this.expenseService.getTemplateById(templateId).subscribe((res: any) => {
      this.setFormValues(res.data);
    });
  }

  isFormatSelected(format: string): boolean {
    const downloadableFormatsArray = this.addTemplateForm.get('downloadableFormats') as FormArray;
    if (downloadableFormatsArray) {
      return downloadableFormatsArray.value.includes(format);
    }
    return false;
  }

  filteredTemplate() {
    const searchTerm = this.searchText.trim().toLowerCase();
    if (searchTerm === '') {
      this.filteredTemplates = this.templates; // Assign a copy of the original list
    } else {
      this.filteredTemplates = this.templates.filter(item =>
        item.policyLabel.toLowerCase().includes(searchTerm)
      );
    }
  }

  categoriesAddOrUpdate(templateId: string, categories: any) {
    if (this.changeMode === 'Add') {
      console.log('add')
      this.addOrUpdateCategories(categories);
    } else {
      console.log('update')
      this.addOrUpdateCategories(categories);
    }
  }

  addOrUpdateCategories(categories: any) {
    if (this.changeMode == 'Add') {
      console.log(categories)
      categories = this.addTemplateForm.get('expenseCategories').value
      console.log(categories)
      this.expenseService.addTemplateApplicableCategories(categories).subscribe(
        (res: any) => {
          this.toast.success('Categories Added successfully!');
        },
        (err) => {
          this.toast.error('Categories cannot be Added', 'ERROR!');
        }
      );
    }
    else {
      if (categories.length === 0) {
        console.log('if empty')
        this.expenseService.addTemplateApplicableCategories(categories).subscribe(
          (res: any) => {
            this.toast.success('Categories updated successfully!');
          },
          (err) => {
            this.toast.error('Categories cannot be updated', 'ERROR!');
          }
        );
      }
      else console.log('Handle Update case')
    }
  }

  getCategoriesByTemplate(id: string) {
    this.selectedTemplateId = id;
    this.expenseService.getCategoriesByTemplate(id).subscribe((res: any) => {
      this.categoryList = res.data;
      const selectedCategories = this.categoryList.map(category => category.expenseCategory);
      this.addTemplateForm.get('expenseCategory').setValue(selectedCategories);
    })
  }
  isSelected(categoryId: string): boolean {
    const selectedCategories = this.addTemplateForm.get('expenseCategories').value;
    console.log(selectedCategories.includes(categoryId))
    return selectedCategories.includes(categoryId);
  }

  getAllCategoriesOfAllTemplate() {
    this.expenseService.getAllCategoriesOfAllTemplate().subscribe((res: any) => {
      const categories = res.data;
      this.templates.forEach(template => {
        this.matchingCategories = categories.filter(category => category.expenseTemplate === template._id);
        template.matchingCategories = this.matchingCategories;
      });
    });
  }

  refreshExpenseTemplateTable() {
    this.getAllTemplates();
  }
}
