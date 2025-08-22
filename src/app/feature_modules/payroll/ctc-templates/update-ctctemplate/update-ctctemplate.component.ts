import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AssignedFixedAllowanceComponent } from '../assigned-templates/fixed-allowance/fixed-allowance.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

const labelValidator: ValidatorFn = (control: AbstractControl) => {
  const value = control.value as string;
  // Check if the value is empty or only whitespace
  if (!value || /^\s*$/.test(value)) {
    return { required: true }; // Treat empty or only whitespace as required error
  }
  // Ensure at least one letter and only allowed characters (letters, spaces, (), /)
  const valid = /^(?=.*[a-zA-Z])[a-zA-Z\s(),/]*$/.test(value);
  return valid ? null : { invalidLabel: true };
};
@Component({
  selector: 'app-update-ctctemplate',
  templateUrl: './update-ctctemplate.component.html',
  styleUrl: './update-ctctemplate.component.css'
})
export class UpdateCTCTemplateComponent {
  isEdit: boolean;
  selectedRecord: any = null;
  @Output() recordUpdatedFromAssigned: EventEmitter<any> = new EventEmitter<any>();
  fixedAllowance: any;
  
  fixedDeduction: any;
  variableAllowance: any;
  variableDeduction: any;
  showAssignedTemplates = true;
  ctcTemplateForm: FormGroup;

  constructor(
    private fb: FormBuilder,    
    private toast: ToastrService,
    private payroll: PayrollService,
    private route: ActivatedRoute,    
    private translate: TranslateService,
    private router: Router
  ) {
    this.ctcTemplateForm = this.fb.group({
      name: ['', [Validators.required, CustomValidators.noNumbersOrSymbolsValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      ctcTemplateFixedAllowance: [[]],
      ctcTemplateFixedDeduction: [[]],
      ctcTemplateVariableAllowance: [[]],
      ctcTemplateVariableDeduction: [[]],
    });
  }

  ngOnInit() {
    this.getDataOfAllPayrollSettings();
    this.route.params.subscribe(param => {
      const id = param['id'];
      if (id) {
        this.isEdit = true;
        this.getRecordById(id);
      } else {
        this.isEdit = false;
        this.clearAllData();
      }
    });
   
    this.selectedRecord = this.payroll.selectedCTCTemplate.getValue();
    if (this.isEdit) {
      this.ctcTemplateForm.patchValue({
        name: this.selectedRecord.name,
        ctcTemplateFixedAllowance: Array.isArray(this.selectedRecord.ctcTemplateFixedAllowances) ? this.selectedRecord.ctcTemplateFixedAllowances.map(item => (item.fixedAllowance?._id)) : [],
        ctcTemplateFixedDeduction: Array.isArray(this.selectedRecord.ctcTemplateFixedDeductions) ? this.selectedRecord.ctcTemplateFixedDeductions.map(item => (item.fixedDeduction?._id)) : [],
        ctcTemplateVariableAllowance: Array.isArray(this.selectedRecord.ctcTemplateVariableAllowances) ? this.selectedRecord.ctcTemplateVariableAllowances.map(item => (item.variableAllowance?._id)) : [],
        ctcTemplateVariableDeduction: Array.isArray(this.selectedRecord.ctcTemplateVariableDeductions) ? this.selectedRecord.ctcTemplateVariableDeductions.map(item => (item.variableDeduction?._id)) : [],
      });
    }
    else {
      this.ctcTemplateForm.reset();
    }
  }
  onNext() {
    const isValid = this.getAssignedTemplates();
    if (!isValid) 
      {
        this.showAssignedTemplates = true;
        return; // Stop here if invalid
      }
      else
      {   
        this.showAssignedTemplates = false;
      }
    
  }
  clearAllData() {
    // Reset form
    this.ctcTemplateForm.reset({
      name: '',
      ctcTemplateFixedAllowance: [],
      ctcTemplateFixedDeduction: [],
      ctcTemplateVariableAllowance: [],
      ctcTemplateVariableDeduction: []
    });

    // Clear selectedRecord
    this.selectedRecord = {
      name: '',
      ctcTemplateFixedAllowances: [],
      ctcTemplateFixedDeductions: [],
      ctcTemplateVariableAllowances: [],
      ctcTemplateVariableDeductions: []
    };

    // Notify PayrollService to clear selected template
    this.payroll.selectedCTCTemplate.next(this.selectedRecord);

    // Clear form values in service
    this.payroll.getFormValues.next({
      name: '',
      ctcTemplateFixedAllowance: [],
      ctcTemplateFixedDeduction: [],
      ctcTemplateVariableAllowance: [],
      ctcTemplateVariableDeduction: []
    });

    // Notify child components via subjects
    this.payroll.fixedAllowances.next([...this.fixedAllowance]);
    this.payroll.fixedDeductions.next([...this.fixedDeduction]);
    this.payroll.variableAllowances.next([...this.variableAllowance]);
    this.payroll.variableDeductions.next([...this.variableDeduction]);
  }
  getAssignedTemplates(): boolean {
    const template = this.ctcTemplateForm.value;
  
    // 1. Validate template name
    if (!template.name || template.name.trim() === '') {
      this.toast.error(this.translate.instant('payroll._ctc_templates.toast.template_name')); 
      return false;
    }
  
    // 2. Validate at least one fixed allowance
    const fixedAllowances = this.ctcTemplateForm.get('ctcTemplateFixedAllowance')?.value;
    if (!fixedAllowances || fixedAllowances.length === 0) {
      this.toast.error(this.translate.instant('payroll._ctc_templates.toast.one_fixed_allowance_required'));
      return false;
    }
    
    const payroll = this.payroll.selectedCTCTemplate.subscribe((data: any) => {
      this.selectedRecord = data;
      this.fixedAllowance = data.ctcTemplateFixedAllowances;
      this.fixedDeduction = data.ctcTemplateFixedDeductions;
      this.variableAllowance = data.ctcTemplateVariableAllowances;
      this.variableDeduction = data.ctcTemplateVariableDeductions;
    });
    const id = this.selectedRecord?._id;
    if (id) {
      this.payroll.isEdit.next(true);
      this.payroll.selectedCTCTemplate.next(this.selectedRecord);
      this.payroll.getFormValues.next(this.ctcTemplateForm.value);
    } else {
      this.payroll.getFormValues.next(this.ctcTemplateForm.value);
    }
    return true;
  }  

  getRecordById(id: string) {
    this.payroll.getCTCTemplateById(id).subscribe((res: any) => {
      const result = res.data;
      this.payroll?.selectedCTCTemplate.next(result);
      this.ctcTemplateForm.patchValue({
        name: result?.name,
        ctcTemplateFixedAllowance: Array.isArray(result.ctcTemplateFixedAllowances) ? result.ctcTemplateFixedAllowances.map(item => (item.fixedAllowance?._id)) : [],
        ctcTemplateFixedDeduction: Array.isArray(result.ctcTemplateFixedDeductions) ? result.ctcTemplateFixedDeductions.map(item => (item.fixedDeduction?._id)) : [],
        ctcTemplateVariableAllowance: Array.isArray(result.ctcTemplateVariableAllowances) ? result.ctcTemplateVariableAllowances.map(item => (item.variableAllowance?._id)) : [],
        ctcTemplateVariableDeduction: Array.isArray(result.ctcTemplateVariableDeductions) ? result.ctcTemplateVariableDeductions.map(item => (item.variableDeduction?._id)) : [],
      });
    });
  }

  onDropdownChange(event: any, type: string) {
    const selectedValues = event.value;
    // Ensure selectedRecord is initialized
    if (!this.selectedRecord) {
      this.selectedRecord = {
        ctcTemplateFixedAllowances: [],
        ctcTemplateFixedDeductions: [],
        ctcTemplateOtherBenefitAllowances: [],
        ctcTemplateVariableAllowances: [],
        ctcTemplateVariableDeductions: []
      };
    }
  
    // Type mappings
    const typeMappings = {
      fixedAllowance: {
        property: 'ctcTemplateFixedAllowances',
        dataSource: this.fixedAllowance,
        subject: this.payroll.fixedAllowances
      },
      fixedDeduction: {
        property: 'ctcTemplateFixedDeductions',
        dataSource: this.fixedDeduction,
        subject: this.payroll.fixedDeductions
      },
      variableAllowance: {
        property: 'ctcTemplateVariableAllowances',
        dataSource: this.variableAllowance,
        subject: this.payroll.variableAllowances
      },
      variableDeduction: {
        property: 'ctcTemplateVariableDeductions',
        dataSource: this.variableDeduction,
        subject: this.payroll.variableDeductions
      }
    };
  
    const mapping = typeMappings[type];
  
    if (mapping) {
      // Remove unselected items
      this.selectedRecord[mapping.property] = this.selectedRecord[mapping.property].filter(item =>
        selectedValues.includes(item[type]?._id)
      );
  
      // Track IDs to prevent duplicates
      const existingIds = new Set(this.selectedRecord[mapping.property].map(item => item[type]?._id));
  
      // Add new selected items if they don't exist
      const newItems = selectedValues
        .filter(value => !existingIds.has(value))
        .map(value => {
          const selectedItem = mapping.dataSource.find(item => item._id === value);
          return selectedItem
            ? {
                [type]: { _id: value, label: selectedItem.label },
                value: '',
                criteria: '',
                minAmount: ''
              }
            : null;
        })
        .filter(item => item !== null); // Remove null values
  
      // Create a new array to trigger change detection
      this.selectedRecord[mapping.property] = [...this.selectedRecord[mapping.property], ...newItems];
  
      // Ensure updates reflect in edit mode
      if (this.isEdit) {
        console.log('Updated in edit mode:', this.selectedRecord[mapping.property]);
      }
  
      // Update form values
      this.ctcTemplateForm.patchValue({
        [type]: this.selectedRecord[mapping.property].map(item => item[type]?._id)
      });
  
      // Notify subscribers with a fresh array copy
      mapping.subject.next([...this.selectedRecord[mapping.property]]);
  
      // Debugging log
      this.payroll.selectedCTCTemplate.next(this.selectedRecord);
    }
  }
  
  
  handleRecordUpdate(updatedRecord: any) {
    this.recordUpdatedFromAssigned.emit(updatedRecord);
  }

  getDataOfAllPayrollSettings() {
    let payload = { next: '', skip: '' };
    this.payroll.getFixedAllowance(payload).subscribe((res: any) => {
      this.fixedAllowance = res.data;
      this.payroll.fixedAllowances.next(this.fixedAllowance);
    });

    this.payroll.getFixedDeduction(payload).subscribe((res: any) => {
      this.fixedDeduction = res.data;
      this.payroll.fixedDeductions.next(this.fixedDeduction); // Note: Likely should be this.fixedDeduction
    });

    this.payroll.getVariableAllowance(payload).subscribe((res: any) => {
      this.variableAllowance = res.data.filter((item: any) => item.isShowINCTCStructure === true);
      this.payroll.variableAllowances.next(this.variableAllowance); // Note: Likely should be this.variableAllowance
    });

    this.payroll.getVariableDeduction(payload).subscribe((res: any) => {
      this.variableDeduction = res.data.filter((item: any) => item.isShowINCTCStructure === true);
      this.payroll.variableDeductions.next(this.variableDeduction); // Note: Likely should be this.variableDeduction
    });
  }

  goBack(){
    this.router.navigate(['home/payroll/ctc-template']);
  }
}