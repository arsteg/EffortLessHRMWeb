import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-expenses-templates',
  templateUrl: './expenses-templates.component.html',
  styleUrls: ['./expenses-templates.component.css']
})
export class ExpensesTemplatesComponent implements OnInit {
  searchText: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  closeResult: string = '';
  templates: any[] = [];
  expenseCategories: any;
  addTemplateForm: FormGroup;
  downloadableFormat = ['PDF', 'PNG', 'JPG', 'DOCX', 'XLS', 'TXT', 'DOC', 'XLSX'];
  selectedTemplateId: any;
  formatChecked: boolean[] = Array(this.downloadableFormat.length).fill(false);
  formatValues: string;
  filteredTemplates: any[] = [];
  categoryList: any;
  selectedCategory: any;
  matchingCategories: any;

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private expenseService: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService) {
    this.addTemplateForm = this.fb.group({
      policyLabel: ['', Validators.required],
      approvalType: ['', Validators.required],
      advanceAmount: [true],
      applyforSameCategorySamedate: [true],
      downloadableFormats: this.fb.array([]),
      expenseTemplate: [''],
      expenseCategory: ['']
    });

  }

  ngOnInit(): void {
    this.getAllTemplates();
    this.getAllExpensesCategories();
    this.filteredTemplate();
    this.getAllCategoriesOfAllTemplate();
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
    this.addTemplateForm.patchValue({
      policyLabel: templateData.policyLabel,
      approvalType: templateData.approvalType,
      downloadableFormats: templateData.downloadableFormats,
      applyforSameCategorySamedate: templateData.applyforSameCategorySamedate,
      advanceAmount: templateData.advanceAmount
    });
    this.expenseService.getTemplateById(templateData._id).subscribe((res: any) => {

      this.formatValues = res.data.downloadableFormats;
      this.formatChecked = this.downloadableFormat?.map(format => this.formatValues?.includes(format));
    });
    this.getCategoriesByTemplate(templateData._id)
  }

  deleteTemplate(_id: string) {
    this.expenseService.deleteTemplate(_id).subscribe((res: any) => {
      const index = this.templates.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.templates.splice(index, 1);
      }
    })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id)
        this.toast.success('Deleted Successfully!');

      }

    });
  }

  getAllTemplates() {
    this.expenseService.getAllTemplates().subscribe((res: any) => {
      this.templates = res.data;
      this.getAllCategoriesOfAllTemplate()
    })
  }

  getAllExpensesCategories() {
    this.expenseService.getExpenseCatgories().subscribe((res: any) => {
      this.expenseCategories = res.data;
    })
  }


  get downloadableFormatsArray() {
    return this.addTemplateForm.get('downloadableFormats') as FormArray;
  }

  get categoriesArray() {
    return this.addTemplateForm.get('selectedCategories') as FormArray;
  }
  onCheckboxChange(event, format: string) {
    const downloadableFormatsArray = this.addTemplateForm.get('downloadableFormats') as FormArray;

    if (event.target.checked) {
      if (downloadableFormatsArray.controls.every(control => control.value !== format)) {
        downloadableFormatsArray.push(this.fb.control(format));
      }
    }
    else {
      const index = downloadableFormatsArray.controls.findIndex(
        (control) => control.value === format
      );
      if (index !== -1) {
        downloadableFormatsArray.removeAt(index);
      }
    }
  }
  addTemplate() {
    let payload = {
      policyLabel: this.addTemplateForm.value.policyLabel,
      approvalType: this.addTemplateForm.value.approvalType,
      applyforSameCategorySamedate: this.addTemplateForm.value.applyforSameCategorySamedate,
      advanceAmount: this.addTemplateForm.value.advanceAmount,
      downloadableFormats: [''],
      expenseTemplate: this.addTemplateForm.value.expenseTemplate,
      expenseCategory: this.addTemplateForm.value.expenseCategory,

    }
    if (this.changeMode === 'Add') {
      payload.downloadableFormats = this.addTemplateForm.value.downloadableFormats;
      this.expenseService.addTemplate(payload).subscribe((res: any) => {
        const newTemplate = res.data;
        this.templates.push(newTemplate);
        const templateId = newTemplate._id;
        this.categoriesAddOrUpdate(templateId, payload.expenseCategory);
        this.toast.success('New Template Created Successfully!');
        this.formatChecked = [false];
        this.addTemplateForm.reset();
      }, err => {
        this.toast.error('Template Can not be Added', 'ERROR!')
      }
      );
    } else {
      const existingFormats = this.formatValues
      const updatedFormats = this.addTemplateForm.value.downloadableFormats;

      payload.downloadableFormats = this.combineFormats(existingFormats, updatedFormats);
      this.expenseService.updateTemplate(this.selectedTemplateId, payload).subscribe((res: any) => {
        const updatedTemplate = res.data;
        const index = this.templates.findIndex(template => template._id === updatedTemplate._id);
        if (index !== -1) {
          this.templates[index] = updatedTemplate;
        }
        this.categoriesAddOrUpdate(this.selectedTemplateId, payload.expenseCategory);
        this.formatChecked = [false];
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
    this.changeMode = 'Update';
    this.expenseService.getTemplateById(templateId).subscribe((res: any) => {
      console.log(res.data)
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

  categoriesAddOrUpdate(templateId: string, categories: any[]) {
    if (this.changeMode === 'Add') {
      console.log('add')
      this.addOrUpdateCategories(templateId, categories);
    } else {
      console.log('update')
      this.addOrUpdateCategories(templateId, categories);
    }
  }

  addOrUpdateCategories(templateId: string, categories: any[]) {
    if (this.changeMode == 'Add') {
      console.log(templateId, categories)
      this.expenseService.addTemplateApplicableCategories(templateId, categories).subscribe(
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
        this.expenseService.addTemplateApplicableCategories(templateId, categories).subscribe(
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
    const selectedCategories = this.addTemplateForm.get('expenseCategory').value;
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

}