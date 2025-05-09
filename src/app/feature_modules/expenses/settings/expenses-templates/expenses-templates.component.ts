import { Component, OnInit, Output, EventEmitter, ViewChild, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-expenses-templates',
  templateUrl: './expenses-templates.component.html',
  styleUrls: ['./expenses-templates.component.css'],
})
export class ExpensesTemplatesComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  searchText: string = '';
  changeMode: 'Add' | 'Next' = 'Add';
  closeResult: string = '';
  templates: any[] = [];
  expenseCategories: any;
  addTemplateForm: FormGroup;
  p: number = 1;
  selectedTemplate: any;
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
  displayedColumns: string[] = ['policyLabel', 'matchingCategories', 'actions'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dialogRef: MatDialogRef<any>;

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
  }

  onClose(event) {
    if (event) {
      this.dialogRef.close();
    }
  }

  onChangeStep(event) {
    this.step = event;
  }

   open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '800px',
      disableClose: false
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
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getAllTemplates();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getAllTemplates();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  getAllTemplates() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.expenseService.getAllTemplates(pagination).subscribe((res: any) => {
      this.templates = res.data;
      this.totalRecords = res.total;
      this.dataSource.data = this.templates;
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        return data.policyLabel.toLowerCase().includes(filter);
      };
    });
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
      this.expenseService.updateTemplate(this.selectedTemplate?._id, payload).subscribe((res: any) => {
        const updatedTemplate = res.data;
        const index = this.templates.findIndex(template => template._id === updatedTemplate._id);
        if (index !== -1) {
          this.templates[index] = updatedTemplate;
        }
        this.categoriesAddOrUpdate(this.selectedTemplate._id, payload.expenseCategories);
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
    this.selectedTemplate = templateId._id;
    this.changeMode = 'Next';
    this.expenseService.getTemplateById(templateId._id).subscribe((res: any) => {
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

  categoriesAddOrUpdate(templateId: string, categories: any) {
    if (this.changeMode === 'Add') {
      this.addOrUpdateCategories(categories);
    } else {
      this.addOrUpdateCategories(categories);
    }
  }

  addOrUpdateCategories(categories: any) {
    if (this.changeMode == 'Add') {
      categories = this.addTemplateForm.get('expenseCategories').value
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
        this.expenseService.addTemplateApplicableCategories(categories).subscribe(
          (res: any) => {
            this.toast.success('Categories updated successfully!');
          },
          (err) => {
            this.toast.error('Categories cannot be updated', 'ERROR!');
          }
        );
      }
    }
  }

  getCategoriesByTemplate(id: string) {
    this.expenseService.getCategoriesByTemplate(id).subscribe((res: any) => {
      this.categoryList = res.data;
      const selectedCategories = this.categoryList.map(category => category.expenseCategory);
      this.addTemplateForm.get('expenseCategory').setValue(selectedCategories);
    })
  }
  isSelected(categoryId: string): boolean {
    const selectedCategories = this.addTemplateForm.get('expenseCategories').value;
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
