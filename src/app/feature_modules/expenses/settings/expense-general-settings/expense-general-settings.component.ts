import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TranslateService } from '@ngx-translate/core';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
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
  isSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private toast: ToastrService,
    private manageService: ManageTeamService
  ) {
    this.addTemplateForm = this.fb.group({
      policyLabel: ['', [Validators.required, Validators.maxLength(30), CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      approvalType: ['', Validators.required],
      expenseCategories: [[], Validators.required],
      advanceAmount: [false],
      applyforSameCategorySamedate: [false],
      downloadableFormats: [this.checkedFormats],
      firstApprovalEmployee: [''],
      expenseTemplate: ['']
    });
  }

  ngOnInit() {
    this.getManagers();
    this.setFormValues();
    this.getAllExpensesCategories();
    this.getAllUsers();
    if (this.changeMode === 'Add') {
      this.addTemplateForm.get('approvalType').setValue('employee-wise');
    }
    this.addTemplateForm.get('approvalType').valueChanges.subscribe((value: any) => {
      this.addTemplateForm.get('firstApprovalEmployee').setValue('');
      this.validateApprovers(value);
    });
    this.addTemplateForm.valueChanges.subscribe(() => {
      this.isSubmitted = false;
    });
  }

  getManagers() {
    this.manageService.getManagers().subscribe((res: any) => {
      this.managers = res.data;
    });
  }

  validateApprovers(approverType) {
    if (approverType === 'template-wise') {
      this.addTemplateForm.get('firstApprovalEmployee').setValidators([Validators.required]);
    } else {
      this.addTemplateForm.get('firstApprovalEmployee').clearValidators();
    }
    this.addTemplateForm.get('firstApprovalEmployee').updateValueAndValidity();
  }

  isDisabledFormat(format) {
    return format != 'PNG' && format != 'JPG' && format != 'PDF';
  }

  isCheckedFormats(format) {
    const downloadableFormats = this.addTemplateForm.get('downloadableFormats').value || [];
    return downloadableFormats.includes(format);
  }

  onFormatsChange(event, format) {
    const formatIndex = this.checkedFormats.indexOf(format);
    if (event.checked) {
      if (formatIndex === -1) {
        this.checkedFormats.push(format);
      }
    } else {
      if (formatIndex !== -1) {
        this.checkedFormats.splice(formatIndex, 1);
      }
    }
    // Sync with form control
    this.addTemplateForm.get('downloadableFormats').setValue([...this.checkedFormats]);
  }

  setFormValues() {
    if (this.changeMode === 'Add') {
      this.checkedFormats = ['DOCX', 'XLS', 'TXT', 'DOC', 'XLSX']; // Reset for Add mode
      this.addTemplateForm.reset({
        policyLabel: '',
        approvalType: 'employee-wise',
        expenseCategories: [],
        advanceAmount: false,
        applyforSameCategorySamedate: false,
        downloadableFormats: this.checkedFormats,
        firstApprovalEmployee: '',
        expenseTemplate: ''
      });
    } else if (this.changeMode === 'Next') {
      const templateData = this.selectedTemplate;
      let expenseCategories = templateData?.applicableCategories
        ? templateData.applicableCategories.map(category => category.expenseCategory._id)
        : [];
      this.checkedFormats = templateData.downloadableFormats?.length
        ? templateData.downloadableFormats
        : ['DOCX', 'XLS', 'TXT', 'DOC', 'XLSX']; // Use saved formats or default
      this.addTemplateForm.patchValue({
        policyLabel: templateData.policyLabel,
        approvalType: templateData.approvalType,
        downloadableFormats: this.checkedFormats,
        applyforSameCategorySamedate: templateData.applyforSameCategorySamedate,
        advanceAmount: templateData.advanceAmount,
        firstApprovalEmployee: templateData.firstApprovalEmployee,
        expenseCategories: expenseCategories
      });
    }
  }
  // closeModal() {
  //   this.isSubmitted = false;
  //   this.close.emit(true);
  //   this.expenseService.selectedTemplate.next('')
  // }
  closeModal() {
    this.isSubmitted = false;
    this.checkedFormats = ['DOCX', 'XLS', 'TXT', 'DOC', 'XLSX']; // Reset to default formats
    this.addTemplateForm.reset({
      policyLabel: '',
      approvalType: 'employee-wise',
      expenseCategories: [],
      advanceAmount: false,
      applyforSameCategorySamedate: false,
      downloadableFormats: this.checkedFormats, // Reset to default formats
      firstApprovalEmployee: '',
      expenseTemplate: ''
    });
    this.close.emit(true);
    this.expenseService.selectedTemplate.next('');
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
    this.isSubmitted = true;
    let payload = {
      policyLabel: this.addTemplateForm.value.policyLabel,
      approvalType: this.addTemplateForm.value.approvalType,
      applyforSameCategorySamedate: this.addTemplateForm.value.applyforSameCategorySamedate,
      advanceAmount: this.addTemplateForm.value.advanceAmount,
      firstApprovalEmployee: this.addTemplateForm.value.firstApprovalEmployee || null,
      downloadableFormats: this.checkedFormats,
      expenseCategories: this.addTemplateForm.value.expenseCategories.map(category => ({ expenseCategory: category }))
    };
    if (this.addTemplateForm.valid) {
      if (this.changeMode === 'Add') {
        this.expenseService.addTemplate(payload).subscribe(
          (res: any) => {
            this.expenseService.selectedTemplate.next(res.data);
            this.expenseService.categories.next(res.categories);
            this.toast.success(this.translate.instant('expenses.template_created_success'));
            this.changeStep.emit(2);
          },
          (err) => {
            this.toast.error(err || this.translate.instant('expenses.template_created_error'));
            // Reset on error
            this.checkedFormats = ['DOCX', 'XLS', 'TXT', 'DOC', 'XLSX'];
            this.addTemplateForm.get('downloadableFormats').setValue(this.checkedFormats);
          }
        );
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
        this.expenseService.updateTemplate(templateId, payload).subscribe(
          (res: any) => {
            this.toast.success(this.translate.instant('expenses.template_updated_success'));
            this.changeStep.emit(2);
          },
          (err) => {
            this.toast.error(err || this.translate.instant('expenses.template_updated_error'));
          }
        );
      }
    } else {
      this.addTemplateForm.markAllAsTouched();
      this.toast.warning(this.translate.instant('expenses.requiredFields'));
    }
  }
}
