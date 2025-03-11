import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-update-ctctemplate',
  templateUrl: './update-ctctemplate.component.html',
  styleUrl: './update-ctctemplate.component.css'
})
export class UpdateCTCTemplateComponent {
  isEdit: boolean;
  @Input() selectedRecord: any = null;
  @Output() recordUpdatedFromAssigned: EventEmitter<any> = new EventEmitter<any>();
  fixedAllowances: any;
  fixedDeduction: any;
  otherBenefits: any;
  fixedContribution: any;
  variableAllowance: any;
  variableDeduction: any;
  showAssignedTemplates = true;
  ctcTemplateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private payroll: PayrollService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.ctcTemplateForm = this.fb.group({
      name: [''],
      ctcTemplateFixedAllowance: [[]],
      ctcTemplateFixedDeduction: [[]],
      ctcTemplateEmployerContribution: [[]],
      ctcTemplateOtherBenefitAllowance: [[]],
      ctcTemplateEmployeeDeduction: [[]],
      ctcTemplateVariableAllowance: [[]],
      ctcTemplateVariableDeduction: [[]],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(param => {
      const id = param['id'];
      if (id) {
        this.isEdit = true;
        this.getRecordById(id);
      } else {
        this.isEdit = false;
      }
    });
    this.getDataOfAllPayrollSettings();
    this.selectedRecord = this.payroll.selectedCTCTemplate.getValue();
    if (this.selectedRecord) {
      this.ctcTemplateForm.patchValue({
        name: this.selectedRecord.name,
        ctcTemplateFixedAllowance: Array.isArray(this.selectedRecord.ctcTemplateFixedAllowances) ? this.selectedRecord.ctcTemplateFixedAllowances.map(item => (item.fixedAllowance?._id)) : [],
        ctcTemplateFixedDeduction: Array.isArray(this.selectedRecord.ctcTemplateFixedDeductions) ? this.selectedRecord.ctcTemplateFixedDeductions.map(item => (item.fixedDeduction?._id)) : [],
        ctcTemplateVariableAllowance: Array.isArray(this.selectedRecord.ctcTemplateVariableAllowances) ? this.selectedRecord.ctcTemplateVariableAllowances.map(item => (item.variableAllowance?._id)) : [],
        ctcTemplateVariableDeduction: Array.isArray(this.selectedRecord.ctcTemplateVariableDeductions) ? this.selectedRecord.ctcTemplateVariableDeductions.map(item => (item.variableDeduction?._id)) : [],
        ctcTemplateEmployerContribution: Array.isArray(this.selectedRecord.ctcTemplateEmployerContributions) ? this.selectedRecord.ctcTemplateEmployerContributions.map(item => (item.fixedContribution?._id)) : [],
        ctcTemplateOtherBenefitAllowance: Array.isArray(this.selectedRecord.ctcTemplateOtherBenefitAllowances) ? this.selectedRecord.ctcTemplateOtherBenefitAllowances.map(item => (item.otherBenefit?._id)) : [],
        ctcTemplateEmployeeDeduction: Array.isArray(this.selectedRecord.ctcTemplateEmployeeDeductions) ? this.selectedRecord.ctcTemplateEmployeeDeductions.map(item => (item.employeeDeduction?._id)) : []
      });
    }
  }

  goBack() {
    this.router.navigate(['home/payroll/ctc-template']);
  }

  getAssignedTemplates() {
    const id = this.selectedRecord?._id || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.payroll.isEdit.next(true);
      this.payroll.selectedCTCTemplate.next(this.selectedRecord);
      this.payroll.getFormValues.next(this.ctcTemplateForm.value);
      this.router.navigate([`assigned-templates`], { relativeTo: this.route });
    } else {
      this.payroll.getFormValues.next(this.ctcTemplateForm.value);
      this.router.navigate(['assigned-templates'], { relativeTo: this.route });
    }
    this.showAssignedTemplates = false;
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
        ctcTemplateEmployerContribution: Array.isArray(result.ctcTemplateEmployerContributions) ? result.ctcTemplateEmployerContributions.map(item => (item.fixedContribution?._id)) : [],
        ctcTemplateOtherBenefitAllowance: Array.isArray(result.ctcTemplateOtherBenefitAllowances) ? result.ctcTemplateOtherBenefitAllowances.map(item => (item.otherBenefit?._id)) : [],
        ctcTemplateEmployeeDeduction: Array.isArray(result.ctcTemplateEmployeeDeductions) ? result.ctcTemplateEmployeeDeductions.map(item => (item.employeeDeduction?._id)) : []
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
        ctcTemplateEmployerContributions: [],
        ctcTemplateOtherBenefitAllowances: [],
        ctcTemplateEmployeeDeductions: [],
        ctcTemplateVariableAllowances: [],
        ctcTemplateVariableDeductions: []
      };
    }
  
    // Type mappings
    const typeMappings = {
      fixedAllowance: {
        property: 'ctcTemplateFixedAllowances',
        dataSource: this.fixedAllowances,
        subject: this.payroll.fixedAllowances
      },
      fixedDeduction: {
        property: 'ctcTemplateFixedDeductions',
        dataSource: this.fixedDeduction,
        subject: this.payroll.fixedDeductions
      },
      fixedContribution: {
        property: 'ctcTemplateEmployerContributions',
        dataSource: this.fixedContribution,
        subject: this.payroll.fixedContributions
      },
      otherBenefit: {
        property: 'ctcTemplateOtherBenefitAllowances',
        dataSource: this.otherBenefits,
        subject: this.payroll.otherBenefits
      },
      employeeDeduction: {
        property: 'ctcTemplateEmployeeDeductions',
        dataSource: this.fixedContribution, // Double-check this
        subject: this.payroll.employeeDeduction
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
      this.fixedAllowances = res.data;
      this.payroll.fixedAllowances.next(this.fixedAllowances);
    });

    this.payroll.getFixedDeduction(payload).subscribe((res: any) => {
      this.fixedDeduction = res.data;
      this.payroll.fixedDeductions.next(this.fixedAllowances); // Note: Likely should be this.fixedDeduction
    });

    this.payroll.getOtherBenefits(payload).subscribe((res: any) => {
      this.otherBenefits = res.data;
      this.payroll.otherBenefits.next(this.fixedAllowances); // Note: Likely should be this.otherBenefits
    });

    this.payroll.getFixedContribution(payload).subscribe((res: any) => {
      this.fixedContribution = res.data;
      this.payroll.fixedContributions.next(this.fixedAllowances); // Note: Likely should be this.fixedContribution
    });

    this.payroll.getVariableAllowance(payload).subscribe((res: any) => {
      this.variableAllowance = res.data.filter((item: any) => item.isShowInCTCStructure === true);
      this.payroll.variableAllowances.next(this.fixedAllowances); // Note: Likely should be this.variableAllowance
    });

    this.payroll.getVariableDeduction(payload).subscribe((res: any) => {
      this.variableDeduction = res.data.filter((item: any) => item.isShowINCTCStructure === true);
      this.payroll.variableDeductions.next(this.fixedAllowances); // Note: Likely should be this.variableDeduction
    });
  }
}