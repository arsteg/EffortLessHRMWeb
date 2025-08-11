import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TranslateService } from '@ngx-translate/core';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
@Component({
  selector: 'app-expense-general-settings',
  templateUrl: './expense-general-settings.component.html',
  styleUrl: './expense-general-settings.component.css'
})
export class ExpenseGeneralSettingsComponent {
  private readonly translate = inject(TranslateService);
  addTemplateForm: FormGroup;
  checkedFormats: any = ['DOCX', 'XLS', 'TXT', 'DOC', 'XLSX']
  downloadableFormat = ['PDF', 'PNG', 'JPG', 'DOCX', 'XLS', 'TXT', 'DOC', 'XLSX'];
  expenseCategories: any = [];
  users: any = [];
  @Input() changeMode: any;
  @Input() selectedTemplate: any;
  @Output() close: any = new EventEmitter();
  @Output() changeStep: any = new EventEmitter();
  managers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private toast: ToastrService,
    private manageService: ManageTeamService
  ) {
    this.addTemplateForm = this.fb.group({
      policyLabel: ['', Validators.required],
      approvalType: ['', Validators.required],
      expenseCategories: [[], Validators.required],
      advanceAmount: [false],
      applyforSameCategorySamedate: [false],
      downloadableFormats: [''],
      firstApprovalEmployee: [''],
      expenseTemplate: ['']
    });
  }

  ngOnInit() {
    this.getManagers();
    this.setFormValues();
    this.getAllExpensesCategories();
    this.getAllUsers();
    this.addTemplateForm.get('approvalLevel').valueChanges.subscribe((value: any) => {
      this.validateApprovers(this.addTemplateForm.get('approvalType').value, value)
    });
    this.addTemplateForm.get('approvalType').valueChanges.subscribe((value: any) => {
      this.validateApprovers(value, this.addTemplateForm.get('approvalLevel').value)
    });
  }

  getManagers() {
    this.manageService.getManagers().subscribe((res: any) => {
      this.managers = res.data;
    });
  }

  validateApprovers(approverType, approverLevel) {
    if (approverLevel == 1 && approverType == 'template-wise') {
      this.addTemplateForm.get('firstApprovalEmployee').setValidators([Validators.required]);
      this.addTemplateForm.get('secondApprovalEmployee').clearValidators();
    } else if (approverLevel == 2 && approverType == 'template-wise') {
      this.addTemplateForm.get('firstApprovalEmployee').setValidators([Validators.required]);
      this.addTemplateForm.get('secondApprovalEmployee').setValidators([Validators.required]);
    } else {
      this.addTemplateForm.get('firstApprovalEmployee').clearValidators();
      this.addTemplateForm.get('secondApprovalEmployee').clearValidators();
    }
    this.addTemplateForm.get('firstApprovalEmployee').updateValueAndValidity();
    this.addTemplateForm.get('secondApprovalEmployee').updateValueAndValidity();
  }

  isDisabledFormat(format) {
    return format != 'PNG' && format != 'JPG' && format != 'PDF';
  }

  isCheckedFormats(format) {
    return this.checkedFormats?.length ? this.checkedFormats.includes(format) : format != 'PNG' && format != 'JPG' && format != 'PDF';
  }

  onFormatsChange(event, format) {
    let formatIndex = this.checkedFormats.findIndex((items: any) => items == format);
    if (formatIndex == -1) {
      this.checkedFormats.push(format);
    } else {
      this.checkedFormats.splice(formatIndex, 1);
    }
  }

  setFormValues() {
    if (this.changeMode === 'Add') {
      this.addTemplateForm.reset();
    }
    const templateData = this.selectedTemplate;
    if (this.changeMode === 'Next') {
      // Map applicableCategories to an array of _id strings
      let expenseCategories = templateData?.applicableCategories
        ? templateData.applicableCategories.map(category => category.expenseCategory._id)
        : [];

      this.addTemplateForm.patchValue({
        policyLabel: templateData.policyLabel,
        approvalType: templateData.approvalType,
        downloadableFormats: templateData.downloadableFormats,
        applyforSameCategorySamedate: templateData.applyforSameCategorySamedate,
        advanceAmount: templateData.advanceAmount,
        firstApprovalEmployee: templateData.firstApprovalEmployee,
        expenseCategories: expenseCategories // Array of _id strings
      });
      this.checkedFormats = templateData.downloadableFormats;
    }
  }

  closeModal() {
    this.close.emit(true);
    this.expenseService.selectedTemplate.next('')
  }

  getAllExpensesCategories() {
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getExpenseCatgories(payload).subscribe((res: any) => {
      this.expenseCategories = res.data;
      this.expenseService.allExpenseCategories.next(this.expenseCategories)
    })
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  createTemplate() {
    let payload = {
      policyLabel: this.addTemplateForm.value.policyLabel,
      approvalType: this.addTemplateForm.value.approvalType,
      applyforSameCategorySamedate: this.addTemplateForm.value.applyforSameCategorySamedate,
      advanceAmount: this.addTemplateForm.value.advanceAmount,
      firstApprovalEmployee: this.addTemplateForm.value.firstApprovalEmployee || null,
      downloadableFormats: this.checkedFormats,
      expenseCategories: this.addTemplateForm.value.expenseCategories.map(category => ({ expenseCategory: category }))
    };
    if (this.changeMode === 'Add') {
      this.expenseService.addTemplate(payload).subscribe((res: any) => {
        this.expenseService.selectedTemplate.next(res.data);
        this.expenseService.categories.next(res.categories);
        this.toast.success(this.translate.instant('expenses.template_created_success'));
        this.changeStep.emit(2);
      }, err => {
        this.toast.error(err || this.translate.instant('expenses.template_created_error'));
      });
    } else {
      let templateId = this.expenseService.selectedTemplate.getValue()._id;
      const isArrayStructureChanged = this.addTemplateForm.value.expenseCategories.some(category => typeof category !== 'object');

      if (isArrayStructureChanged) {
        payload.expenseCategories = this.addTemplateForm.value.expenseCategories.map(category => ({ expenseCategory: category }));
        this.expenseService.categories.next(payload.expenseCategories);
      } else {
        payload.expenseCategories = this.addTemplateForm.value.expenseCategories.map(category => ({ expenseCategory: category.expenseCategory }));
        this.expenseService.categories.next(payload.expenseCategories);

      }
      this.expenseService.updateTemplate(templateId, payload).subscribe((res: any) => {
        this.toast.success(this.translate.instant('expenses.template_updated_success'));
        this.changeStep.emit(2);
      }, err => {
        this.toast.error(err || this.translate.instant('expenses.template_updated_error'));
      });
    }
  }

}
