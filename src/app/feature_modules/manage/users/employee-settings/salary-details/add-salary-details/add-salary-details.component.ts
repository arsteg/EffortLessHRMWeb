import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-add-salary-details',
  templateUrl: './add-salary-details.component.html',
  styleUrls: ['./add-salary-details.component.css']
})
export class AddSalaryDetailsComponent {
  @Output() backToSalaryDetails = new EventEmitter<void>();
  disableSelect = new FormControl(false);
  salaryDetailsForm: FormGroup;
  selectedUser: any;
  ctcTemplates: any[] = [];
  pfTemplates: any;
  allFixedAllowance: any;
  employerContribution: any;
  fixedDeduction: any;
  variableAllowance: any;
  variableDeduction: any;
  pfCharge: any;
  @Input() edit: boolean = false;
  @Input() selectedSalaryDetail: any;
  salaryDetails: any;
  payrollCTCTemplates: any;
  addButtons: boolean = true;
  statutorySettings: any;
  payrollGeneralSettings: any;
  fixedAllowance: any[] = [];
  employeeDeduction: any;

  view = localStorage.getItem('view');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  private noNegativeValues(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isNegative = control.value < 0;
      return isNegative ? { 'negativeValue': { value: control.value } } : null;
    };
  }

  private onlyNumbers(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === '') {
        return null;
      }
      const stringValue = value.toString();
      const hasSpecialCharacters = /[^0-9]/.test(stringValue);
      if (hasSpecialCharacters) {
        return { 'specialCharacters': { value: stringValue, invalidChars: stringValue.match(/[^0-9]/g) } };
      }
      const isValid = /^[0-9]*$/.test(stringValue);
      return isValid ? null : { 'invalidNumber': { value: stringValue } };
    };
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private payrollService: PayrollService,
    private toast: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.salaryDetailsForm = this.fb.group({
      user: [''],
      payrollEffectiveFrom: [''],
      frequencyToEnterCTC: [''],
      CTCTemplate: ['manual'],
      isEmployerPartInclusiveInSalaryStructure: [{ value: true, disabled: true }],
      enteringAmount: ['Yearly'],
      Amount: [0, [this.noNegativeValues(), this.onlyNumbers()]],
      totalCTCExcludingVariableAndOtherBenefits: [0],
      totalCTCIncludingVariable: [0],
      employeeSalaryTaxAndStatutorySetting: this.fb.group({
        isPFDeduction: [false],
        isEmployeePFCappedAtPFCeiling: [false],
        isEmployerPFCappedAtPFCeiling: [false],
        fixedAmountForProvidentFundWage: [0, [this.noNegativeValues(), this.onlyNumbers()]],
        pfTemplate: [''],
        isESICDeduction: [false],
        isPTDeduction: [false],
        isLWFDeduction: [false],
        isGratuityApplicable: [false],
        isIncomeTaxDeduction: [false],
        isPFChargesApplicable: [false],
        isRoundOffApplicable: [false]
      }),
      salaryComponentFixedAllowance: this.fb.array([]),
      salaryComponentEmployerContribution: this.fb.array([]),
      salaryComponentEmployeeDeduction: this.fb.array([]),
      salaryComponentFixedDeduction: this.fb.array([]),
      salaryComponentVariableAllowance: this.fb.array([]),
      salaryComponentVariableDeduction: this.fb.array([]),
      salaryComponentPFCharge: this.fb.array([])
    }, { validators: this.totalSalaryComponentsValidator() });
  }

  ngOnInit(): void {
    this.logUrlSegmentsForUser();
    this.getCTCTemplates().then(() => {
      this.getAllComponents();
      this.salaryDetailsForm.get('frequencyToEnterCTC')?.setValue('Yearly');
      this.salaryDetailsForm.get('frequencyToEnterCTC')?.disable({ emitEvent: false });
      if (this.edit) {
        this.getSalaryDetailsById();
      } else {
        this.payrollService.getGeneralSettings(this.selectedUser?.company?._id).subscribe((res: any) => {
          this.payrollGeneralSettings = res.data;
        });
        this.getStatutorySettings();
        this.salaryDetailsForm.patchValue({ CTCTemplate: 'manual' }, { emitEvent: false });
        this.addFixedAllowance();
        this.addFixedDeduction();
        this.addVariableAllowance();
        this.addVariableDeduction();
        this.subscribeToFormArrayChanges();
        this.salaryDetailsForm.get('Amount')?.valueChanges.subscribe(() => {
          this.calculateStatutoryComponents();
        });
        this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.valueChanges.subscribe(() => {
          this.calculateStatutoryComponents();
        });
      }
      this.cdr.detectChanges();
    });
  }

  subscribeToFormArrayChanges(): void {
    const formArrays = [
      'salaryComponentFixedAllowance',
      'salaryComponentFixedDeduction',
      'salaryComponentVariableAllowance',
      'salaryComponentVariableDeduction'
    ];
    formArrays.forEach(arrayName => {
      const formArray = this.salaryDetailsForm.get(arrayName) as FormArray;
      formArray.valueChanges.subscribe(() => {
        this.CalculateTotalAmount();
        this.cdr.detectChanges();
      });
      formArray.controls.forEach((control, index) => {
        this.subscribeToFormGroupChanges(control as FormGroup, arrayName, index);
      });
    });
  }

  subscribeToFormGroupChanges(group: FormGroup, arrayName: string, index: number): void {
    group.get('monthlyAmount')?.valueChanges.subscribe(() => {
      this.updateYearlyAmount(index, arrayName);
      this.CalculateTotalAmount();
      this.cdr.detectChanges();
    });
    group.get('fixedAllowance')?.valueChanges.subscribe(value => {
      this.updateLabel(index, value, arrayName.replace('salaryComponent', '').toLowerCase());
      this.cdr.detectChanges();
    });
    group.get('fixedDeduction')?.valueChanges.subscribe(value => {
      this.updateLabel(index, value, arrayName.replace('salaryComponent', '').toLowerCase());
      this.cdr.detectChanges();
    });
    group.get('variableAllowance')?.valueChanges.subscribe(value => {
      this.updateLabel(index, value, arrayName.replace('salaryComponent', '').toLowerCase());
      this.cdr.detectChanges();
    });
    group.get('variableDeduction')?.valueChanges.subscribe(value => {
      this.updateLabel(index, value, arrayName.replace('salaryComponent', '').toLowerCase());
      this.cdr.detectChanges();
    });
  }

  getCTCTemplates(): Promise<void> {
    return new Promise((resolve, reject) => {
      let payload = { next: '', skip: '' };
      this.payrollService.getCTCTemplate(payload).subscribe({
        next: (res: any) => {
          this.ctcTemplates = res.data || [];
          this.cdr.detectChanges();
          resolve();
        },
        error: (err) => {
          this.toast.error('Error fetching CTC templates', 'Error');
          reject(err);
        }
      });
    });
  }

  getSalaryDetailsById(): void {
    let id = this.selectedSalaryDetail._id;
    this.userService.getSalaryDetailsById(id).subscribe({
      next: (res: any) => {
        this.salaryDetails = res.data;
        const ctcTemplateId = res.data.CTCTemplate?._id || res.data.ctcTemplate?._id || res.data.CTCTemplate || 'manual';
       
        const isValidTemplate = ctcTemplateId === 'manual' || this.ctcTemplates.some(t => t._id === ctcTemplateId);
        if (!isValidTemplate && ctcTemplateId !== 'manual') {
           this.toast.warning('Selected CTC template not found, defaulting to manual');
        }

        // Patch top-level form fields
        this.salaryDetailsForm.patchValue({
          user: res.data.user?._id || res.data.user,
          payrollEffectiveFrom: res.data.payrollEffectiveFrom,
          frequencyToEnterCTC: res.data.frequencyToEnterCTC || 'Yearly',
          CTCTemplate: isValidTemplate ? ctcTemplateId : 'manual',
          isEmployerPartInclusiveInSalaryStructure: res.data.isEmployerPartInclusiveInSalaryStructure,
          Amount: res.data.Amount || 0,
          totalCTCExcludingVariableAndOtherBenefits: res.data.totalCTCExcludingVariableAndOtherBenefits || 0,
          totalCTCIncludingVariable: res.data.totalCTCIncludingVariable || 0
        }, { emitEvent: false });

        // Patch Tax and Statutory Settings
        const taxAndStatutorySettingGroup = this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting') as FormGroup;
        taxAndStatutorySettingGroup.patchValue(res.data.taxAndSalutaorySetting?.[0] || {}, { emitEvent: false });

        // Patch Fixed Allowance
        const salaryComponentFixedAllowance = res.data.fixedAllowanceList || [];
        this.fixedAllowances.clear();
        salaryComponentFixedAllowance.forEach((allowance) => {
          this.addFixedAllowance();
          this.fixedAllowances.at(this.fixedAllowances.length - 1).patchValue({
            fixedAllowance: allowance.fixedAllowance?._id || allowance.fixedAllowance,
            fixedAllowanceLabel: allowance.fixedAllowance?.label || allowance.label,
            monthlyAmount: Math.abs(allowance.monthlyAmount) || 0,
            yearlyAmount: Math.abs(allowance.yearlyAmount) || 0,
            isNew: false
          }, { emitEvent: false });
        });

        // Patch Fixed Deduction
        const salaryComponentFixedDeduction = res.data.fixedDeductionList || [];
        this.fixedDeductionArray.clear();
        salaryComponentFixedDeduction.forEach((benefit) => {
          this.addFixedDeduction();
          this.fixedDeductionArray.at(this.fixedDeductionArray.length - 1).patchValue({
            fixedDeduction: benefit.fixedDeduction?._id || benefit.fixedDeduction,
            fixedDeductionLabel: benefit.fixedDeduction?.label || benefit.label,
            monthlyAmount: Math.abs(benefit.monthlyAmount) || 0,
            yearlyAmount: Math.abs(benefit.yearlyAmount) || 0,
            isNew: false
          }, { emitEvent: false });
        });

        // Patch Variable Allowance
        const salaryComponentVariableAllowance = res.data.variableAllowanceList || [];
        this.variableAllowanceArray.clear();
        salaryComponentVariableAllowance.forEach((benefit) => {
          this.addVariableAllowance();
          this.variableAllowanceArray.at(this.variableAllowanceArray.length - 1).patchValue({
            variableAllowance: benefit.variableAllowance?._id || benefit.variableAllowance,
            variableAllowanceLabel: benefit.variableAllowance?.label || benefit.label,
            monthlyAmount: Math.abs(benefit.monthlyAmount) || 0,
            yearlyAmount: Math.abs(benefit.yearlyAmount) || 0,
            isNew: false
          }, { emitEvent: false });
        });

        // Patch Variable Deduction
        const salaryComponentVariableDeduction = res.data.variableDeductionList || [];
        this.variableDeductionArray.clear();
        salaryComponentVariableDeduction.forEach((benefit) => {
          this.addVariableDeduction();
          this.variableDeductionArray.at(this.variableDeductionArray.length - 1).patchValue({
            variableDeduction: benefit.variableDeduction?._id || benefit.variableDeduction,
            variableDeductionLabel: benefit.variableDeduction?.label || benefit.label,
            monthlyAmount: Math.abs(benefit.monthlyAmount) || 0,
            yearlyAmount: Math.abs(benefit.yearlyAmount) || 0,
            isNew: false
          }, { emitEvent: false });
        });

        // Patch Employer Contribution and Employee Deduction
        const employerContributionArray = this.salaryDetailsForm.get('salaryComponentEmployerContribution') as FormArray;
        employerContributionArray.clear();
        (res.data.employerContributionList || []).forEach((contribution) => {
          employerContributionArray.push(this.fb.group({
            employerContribution: contribution.employerContribution?._id || contribution.employerContribution,
            employerContributionLabel: contribution.employerContribution?.label || contribution.label,
            monthlyAmount: Math.abs(contribution.monthlyAmount) || 0,
            yearlyAmount: Math.abs(contribution.yearlyAmount) || 0
          }));
        });

        const employeeDeductionArray = this.salaryDetailsForm.get('salaryComponentEmployeeDeduction') as FormArray;
        employeeDeductionArray.clear();
        (res.data.employeeDeductionList || []).forEach((deduction) => {
          employeeDeductionArray.push(this.fb.group({
            employeeDeduction: deduction.employeeDeduction?._id || deduction.employeeDeduction,
            employeeDeductionLabel: deduction.employeeDeduction?.label || deduction.label,
            monthlyAmount: Math.abs(deduction.monthlyAmount) || 0,
            yearlyAmount: Math.abs(deduction.yearlyAmount) || 0
          }));
        });

        // Disable form controls in edit mode
        if (this.edit) {
          this.disableFormControls(this.salaryDetailsForm);
        }

        // Calculate total amount to ensure UI consistency
        this.CalculateTotalAmount();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('Error fetching salary details', 'Error');
      }
    });
  }

  getCTCTemplateName(templateId: string | null | undefined): string {
    if (!templateId) {
      console.warn('CTCTemplate ID is null or undefined');
      return 'Unknown Template';
    }
    if (templateId === 'manual') return 'Enter Manually';
    const template = this.ctcTemplates.find(t => t._id === templateId);
    if (!template) {
      console.warn('No template found for ID:', templateId);
      return 'Unknown Template';
    }
    return template.name;
  }

  totalSalaryComponentsValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const grossSalary = formGroup.get('Amount')?.value || 0;
      const arrays = [
        'salaryComponentFixedAllowance',
        'salaryComponentFixedDeduction',
        'salaryComponentVariableAllowance',
        'salaryComponentVariableDeduction',
      ];

      let totalYearlyAmount = 0;

      arrays.forEach(arrayName => {
        const formArray = formGroup.get(arrayName) as FormArray;
        formArray.controls.forEach(control => {
          const yearlyAmount = control.get('yearlyAmount')?.value || 0;
          totalYearlyAmount += yearlyAmount;
        });
      });

      return totalYearlyAmount <= grossSalary ? null : { exceedsGrossSalary: true };
    };
  }

  getAllComponents() {
    forkJoin({
      fixedAllowance: this.payrollService.getFixedAllowance({ next: '', skip: '' }),
      fixedDeduction: this.payrollService.getFixedDeduction({ next: '', skip: '' }),
      variableAllowance: this.payrollService.getVariableAllowance({ next: '', skip: '' }),
      variableDeduction: this.payrollService.getVariableDeduction({ next: '', skip: '' }),
    }).subscribe(result => {
      this.fixedAllowance = result.fixedAllowance.data;
      this.fixedDeduction = result.fixedDeduction.data;
      this.variableAllowance = result.variableAllowance.data;
      this.variableDeduction = result.variableDeduction.data;
      this.cdr.detectChanges();
    });
  }

  onCTCTemplateChange(value: string): void {
    if (this.edit) {
      return; // Prevent template changes in edit mode
    }
    if (value === 'manual') {
      this.enableManualEntry();
      if (this.fixedAllowances.length === 0) {
        this.addFixedAllowance();
      }
      if (this.fixedDeductionArray.length === 0) {
        this.addFixedDeduction();
      }
      if (this.variableAllowanceArray.length === 0) {
        this.addVariableAllowance();
      }
      if (this.variableDeductionArray.length === 0) {
        this.addVariableDeduction();
      }
    } else {
      this.getCTCTemplateById(value);
      this.fixedAllowances.clear();
      this.fixedDeductionArray.clear();
      this.variableAllowanceArray.clear();
      this.variableDeductionArray.clear();
    }
    this.subscribeToFormArrayChanges();
    this.cdr.detectChanges();
  }

  disableFormControls(formGroup: FormGroup | FormArray) {
    if (formGroup instanceof FormGroup) {
      formGroup.disable({ emitEvent: false });
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.disableFormControls(control);
        } else {
          control.disable({ emitEvent: false });
        }
      });
    } else if (formGroup instanceof FormArray) {
      formGroup.controls.forEach(control => {
        const group = control as FormGroup;
        this.disableFormControls(group);
        Object.keys(group.controls).forEach(key => {
          group.get(key)?.disable({ emitEvent: false });
        });
      });
      formGroup.disable({ emitEvent: false });
    }
    if (formGroup.get('Amount')) {
      formGroup.get('Amount')?.disable({ emitEvent: false });
    }
    if (formGroup.get('CTCTemplate')) {
      formGroup.get('CTCTemplate')?.disable({ emitEvent: false });
    }
    if (formGroup.get('payrollEffectiveFrom')) {
      formGroup.get('payrollEffectiveFrom')?.disable({ emitEvent: false });
    }
    if (formGroup.get('isEmployerPartInclusiveInSalaryStructure')) {
      formGroup.get('isEmployerPartInclusiveInSalaryStructure')?.disable({ emitEvent: false });
    }
    this.cdr.detectChanges();
  }

  get employeeSalaryTaxAndStatutorySetting(): FormGroup {
    return this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting') as FormGroup;
  }

  get fixedAllowances(): FormArray {
    return this.salaryDetailsForm.get('salaryComponentFixedAllowance') as FormArray;
  }

  get fixedDeductionArray(): FormArray {
    return this.salaryDetailsForm.get('salaryComponentFixedDeduction') as FormArray;
  }

  get variableAllowanceArray(): FormArray {
    return this.salaryDetailsForm.get('salaryComponentVariableAllowance') as FormArray;
  }

  get variableDeductionArray(): FormArray {
    return this.salaryDetailsForm.get('salaryComponentVariableDeduction') as FormArray;
  }

  private getSelectedIds(formArray: FormArray, controlName: string): string[] {
    return formArray.controls
      .map(control => control.get(controlName)?.value)
      .filter(value => value !== null && value !== undefined && value !== '');
  }

  isOptionDisabled(optionId: string, currentIndex: number, formArray: FormArray, controlName: string): boolean {
    const selectedIds = this.getSelectedIds(formArray, controlName);
    const isAlreadySelected = selectedIds.filter((id, idx) => idx !== currentIndex).includes(optionId);
    return isAlreadySelected;
  }

  updateLabel(index: number, value: string, type: string): void {
    let formArray: FormArray;
    let itemsList: any[];
    let labelControlName: string;

    switch (type) {
      case 'fixedAllowance':
        formArray = this.fixedAllowances;
        itemsList = this.fixedAllowance;
        labelControlName = 'fixedAllowanceLabel';
        break;
      case 'fixedDeduction':
        formArray = this.fixedDeductionArray;
        itemsList = this.fixedDeduction;
        labelControlName = 'fixedDeductionLabel';
        break;
      case 'variableAllowance':
        formArray = this.variableAllowanceArray;
        itemsList = this.variableAllowance;
        labelControlName = 'variableAllowanceLabel';
        break;
      case 'variableDeduction':
        formArray = this.variableDeductionArray;
        itemsList = this.variableDeduction;
        labelControlName = 'variableDeductionLabel';
        break;
      default:
        return;
    }

    const control = formArray.at(index);
    const selectedItem = itemsList.find(item => item._id === value);
    if (selectedItem) {
      control.patchValue({ [labelControlName]: selectedItem.label }, { emitEvent: false });
    }
    this.CalculateTotalAmount();
    this.cdr.detectChanges();
  }

  updateYearlyAmount(index: number, formArrayName: string): void {
    const array = this.salaryDetailsForm.get(formArrayName) as FormArray;
    const control = array.at(index);
    const monthly = control.get('monthlyAmount')?.value || 0;

    if (monthly >= 0) {
      control.patchValue({ yearlyAmount: monthly * 12 }, { emitEvent: false });
    } else {
      control.patchValue({ yearlyAmount: 0 }, { emitEvent: false });
    }
    this.CalculateTotalAmount();
    this.cdr.detectChanges();
  }

  restrictToDigits(event: Event): void {
    if (this.edit) return;
    const input = event.target as HTMLInputElement;
    let value = input.value;
    const cleanedValue = value.replace(/[^0-9]/g, '');
    if (value !== cleanedValue) {
      input.value = cleanedValue;
      const control = this.salaryDetailsForm.get(input.name) || 
        this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.get(input.name) ||
        this.findControlInFormArray(input.name);
      if (control) {
        control.setValue(cleanedValue, { emitEvent: false });
        control.markAsTouched();
      }
    }
    this.CalculateTotalAmount();
    this.cdr.detectChanges();
  }

  preventNegative(event: KeyboardEvent): void {
    if (this.edit) return;
    if (event.key === '-' || event.key === '+') {
      event.preventDefault();
    }
  }

  handlePaste(event: ClipboardEvent): void {
    if (this.edit) return;
    const pastedText = event.clipboardData?.getData('text') || '';
    const cleanedText = pastedText.replace(/[^0-9]/g, '');
    if (pastedText !== cleanedText) {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      input.value = cleanedText;
      const control = this.salaryDetailsForm.get(input.name) || 
        this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.get(input.name) ||
        this.findControlInFormArray(input.name);
      if (control) {
        control.setValue(cleanedText, { emitEvent: false });
        control.markAsTouched();
      }
    }
    this.CalculateTotalAmount();
    this.cdr.detectChanges();
  }

  private findControlInFormArray(controlName: string): AbstractControl | null {
    const formArrays = [
      'salaryComponentFixedAllowance',
      'salaryComponentFixedDeduction',
      'salaryComponentVariableAllowance',
      'salaryComponentVariableDeduction'
    ];
    for (const arrayName of formArrays) {
      const formArray = this.salaryDetailsForm.get(arrayName) as FormArray;
      for (const control of formArray.controls) {
        if (control.get(controlName)) {
          return control.get(controlName);
        }
      }
    }
    return null;
  }

  addFixedAllowance(): void {
    const allowanceGroup = this.fb.group({
      fixedAllowanceLabel: [''],
      fixedAllowance: ['', Validators.required],
      monthlyAmount: [0, [Validators.required, this.noNegativeValues(), this.onlyNumbers()]],
      yearlyAmount: [0, [Validators.required, this.noNegativeValues(), this.onlyNumbers()]],
      isNew: [true]
    });
    this.fixedAllowances.push(allowanceGroup);
    this.subscribeToFormGroupChanges(allowanceGroup, 'salaryComponentFixedAllowance', this.fixedAllowances.length - 1);
    if (this.edit) {
      this.disableFormControls(this.fixedAllowances);
    }
    this.CalculateTotalAmount();
    this.cdr.detectChanges();
  }

  removeFixedAllowance(index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to delete this fixed allowance?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.fixedAllowances.removeAt(index);
        this.CalculateTotalAmount();
        this.toast.success('Fixed Allowance deleted successfully');
        this.cdr.detectChanges();
      }
    });
  }

  addFixedDeduction(): void {
    const allowanceGroup = this.fb.group({
      fixedDeduction: ['', Validators.required],
      fixedDeductionLabel: [''],
      monthlyAmount: [0, [Validators.required, this.noNegativeValues(), this.onlyNumbers()]],
      yearlyAmount: [0, [Validators.required, this.noNegativeValues(), this.onlyNumbers()]],
      isNew: [true]
    });
    this.fixedDeductionArray.push(allowanceGroup);
    this.subscribeToFormGroupChanges(allowanceGroup, 'salaryComponentFixedDeduction', this.fixedDeductionArray.length - 1);
    if (this.edit) {
      this.disableFormControls(this.fixedDeductionArray);
    }
    this.CalculateTotalAmount();
    this.cdr.detectChanges();
  }

  removeFixedDeduction(index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to delete this fixed deduction?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.fixedDeductionArray.removeAt(index);
        this.CalculateTotalAmount();
        this.toast.success('Fixed Deduction deleted successfully');
        this.cdr.detectChanges();
      }
    });
  }

  addVariableAllowance(): void {
    const allowanceGroup = this.fb.group({
      variableAllowance: ['', Validators.required],
      variableAllowanceLabel: [''],
      monthlyAmount: [0, [Validators.required, this.noNegativeValues(), this.onlyNumbers()]],
      yearlyAmount: [0, [Validators.required, this.noNegativeValues(), this.onlyNumbers()]],
      isNew: [true]
    });
    this.variableAllowanceArray.push(allowanceGroup);
    this.subscribeToFormGroupChanges(allowanceGroup, 'salaryComponentVariableAllowance', this.variableAllowanceArray.length - 1);
    if (this.edit) {
      this.disableFormControls(this.variableAllowanceArray);
    }
    this.CalculateTotalAmount();
    this.cdr.detectChanges();
  }

  removeVariableAllowance(index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to delete this variable allowance?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.variableAllowanceArray.removeAt(index);
        this.CalculateTotalAmount();
        this.toast.success('Variable Allowance deleted successfully');
        this.cdr.detectChanges();
      }
    });
  }

  addVariableDeduction(): void {
    const allowanceGroup = this.fb.group({
      variableDeduction: ['', Validators.required],
      variableDeductionLabel: [''],
      monthlyAmount: [0, [Validators.required, this.noNegativeValues(), this.onlyNumbers()]],
      yearlyAmount: [0, [Validators.required, this.noNegativeValues(), this.onlyNumbers()]],
      isNew: [true]
    });
    this.variableDeductionArray.push(allowanceGroup);
    this.subscribeToFormGroupChanges(allowanceGroup, 'salaryComponentVariableDeduction', this.variableDeductionArray.length - 1);
    if (this.edit) {
      this.disableFormControls(this.variableDeductionArray);
    }
    this.CalculateTotalAmount();
    this.cdr.detectChanges();
  }

  removeVariableDeduction(index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to delete this variable deduction?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.variableDeductionArray.removeAt(index);
        this.CalculateTotalAmount();
        this.toast.success('Variable Deduction deleted successfully');
        this.cdr.detectChanges();
      }
    });
  }

  logUrlSegmentsForUser() {
    const urlPath = this.router.url;
    const segments = urlPath.split('/').filter(segment => segment);
    if (segments.length >= 3) {
      let employee;
      if (this.view === 'admin') { employee = segments[segments.length - 3]; }
      else { employee = this.currentUser?.empCode }
      this.userService.getUserByEmpCode(employee).subscribe((res: any) => {
        this.selectedUser = res.data[0];
      });
    }
  }

  calculateStatutoryComponents(): void {
    const employerContributionArray = this.salaryDetailsForm.get('salaryComponentEmployerContribution') as FormArray;
    employerContributionArray.clear();
    if (this.ctcTemplates && this.salaryDetailsForm.get('CTCTemplate').value !== 'manual' && !this.edit) {
      const templateId = this.salaryDetailsForm.get('CTCTemplate').value;
      const selectedTemplate = this.ctcTemplates.find((t: any) => t._id === templateId);
      if (selectedTemplate && selectedTemplate.ctcTemplateEmployerContributions) {
        selectedTemplate.ctcTemplateEmployerContributions.forEach((contribution: any) => {
          employerContributionArray.push(this.fb.group({
            employerContribution: [contribution.fixedContribution?._id],
            employerContributionLabel: [contribution.fixedContribution?.label],
            monthlyAmount: [contribution.value || 0],
            yearlyAmount: [(contribution.value || 0) * 12]
          }));
        });
      }
    }
    this.salaryDetailsForm.setControl('salaryComponentEmployerContribution', employerContributionArray);

    const employeeDeductionArray = this.salaryDetailsForm.get('salaryComponentEmployeeDeduction') as FormArray;
    employeeDeductionArray.clear();
    if (this.ctcTemplates && this.salaryDetailsForm.get('CTCTemplate').value !== 'manual' && !this.edit) {
      const templateId = this.salaryDetailsForm.get('CTCTemplate').value;
      const selectedTemplate = this.ctcTemplates.find((t: any) => t._id === templateId);
      if (selectedTemplate && selectedTemplate.ctcTemplateEmployerContributions) {
        selectedTemplate.ctcTemplateEmployerContributions.forEach((contribution: any) => {
          employeeDeductionArray.push(this.fb.group({
            employeeDeduction: [contribution.fixedContribution?._id],
            employeeDeductionLabel: [contribution.fixedContribution?.label],
            monthlyAmount: [contribution.value || 0],
            yearlyAmount: [(contribution.value || 0) * 12]
          }));
        });
      }
    }
    this.salaryDetailsForm.setControl('salaryComponentEmployeeDeduction', employeeDeductionArray);
    this.CalculateTotalAmount();
    this.cdr.detectChanges();
  }

  onSubmissionSalaryDetails(): void {
    if (this.salaryDetailsForm.invalid) {
      this.toast.error('Please fill all required fields correctly.', 'Error');
      return;
    }

    const payload = this.salaryDetailsForm.value;
    this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.enable({ emitEvent: false });
    payload.employeeSalaryTaxAndStatutorySetting = [this.employeeSalaryTaxAndStatutorySetting.value];
    payload.user = this.userService.selectedEmployee.getValue().id;

    payload.salaryComponentFixedAllowance = this.fixedAllowances.controls.map(control => ({
      fixedAllowance: control.get('fixedAllowance')?.value,
      monthlyAmount: control.get('monthlyAmount')?.value || 0,
      yearlyAmount: control.get('yearlyAmount')?.value || 0
    }));

    payload.salaryComponentEmployerContribution = this.salaryDetailsForm.get('salaryComponentEmployerContribution')?.value.map(item => ({
      employerContribution: item.employerContribution,
      monthlyAmount: item.monthlyAmount || 0,
      yearlyAmount: item.yearlyAmount || 0
    }));

    payload.salaryComponentEmployeeDeduction = this.salaryDetailsForm.get('salaryComponentEmployeeDeduction')?.value.map(item => ({
      employeeDeduction: item.employeeDeduction,
      monthlyAmount: item.monthlyAmount || 0,
      yearlyAmount: item.yearlyAmount || 0
    }));

    payload.salaryComponentFixedDeduction = this.fixedDeductionArray.controls.map(control => ({
      fixedDeduction: control.get('fixedDeduction')?.value,
      monthlyAmount: control.get('monthlyAmount')?.value || 0,
      yearlyAmount: control.get('yearlyAmount')?.value || 0
    }));

    payload.salaryComponentVariableAllowance = this.variableAllowanceArray.controls.map(control => ({
      variableAllowance: control.get('variableAllowance')?.value,
      monthlyAmount: control.get('monthlyAmount')?.value || 0,
      yearlyAmount: control.get('yearlyAmount')?.value || 0
    }));

    payload.salaryComponentVariableDeduction = this.variableDeductionArray.controls.map(control => ({
      variableDeduction: control.get('variableDeduction')?.value,
      monthlyAmount: control.get('monthlyAmount')?.value || 0,
      yearlyAmount: control.get('yearlyAmount')?.value || 0
    }));

    payload.salaryComponentPFCharge = payload.salaryComponentPFCharge.filter(item => item?.pfCharge !== '');
    payload.frequencyToEnterCTC = 'Yearly';

    this.userService.addSalaryDetails(payload).subscribe(
      (res: any) => {
        this.toast.success('The salary details have been successfully added.');
      },
      err => {
        this.toast.error('The salary details cannot be added', 'Error');
      }
    );
  }

  getCTCTemplateById(id: string): void {
    if (this.edit) {
      return; // Prevent fetching template in edit mode
    }
    this.payrollService.getCTCTemplateById(id).subscribe(
      (ctcTemplate: any) => {
        const fixedAllowanceArray = this.salaryDetailsForm.get('salaryComponentFixedAllowance') as FormArray;
        fixedAllowanceArray.clear();
        ctcTemplate.data.ctcTemplateFixedAllowances.forEach((fixedAllowance: any) => {
          if (fixedAllowance.criteria == 'Amount') {
            fixedAllowanceArray.push(this.fb.group({
              fixedAllowance: [fixedAllowance.fixedAllowance?._id],
              fixedAllowanceLabel: [fixedAllowance.fixedAllowance?.label],
              monthlyAmount: [fixedAllowance.value],
              yearlyAmount: [fixedAllowance.value * 12]
            }));
          }
          if (fixedAllowance.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (fixedAllowance.value / 100) * grossPay;
            fixedAllowanceArray.push(this.fb.group({
              fixedAllowance: [fixedAllowance.fixedAllowance?._id],
              fixedAllowanceLabel: [fixedAllowance.fixedAllowance?.label],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            }));
          }
        });
        this.salaryDetailsForm.setControl('salaryComponentFixedAllowance', fixedAllowanceArray);

        const fixedDeductionArray = this.salaryDetailsForm.get('salaryComponentFixedDeduction') as FormArray;
        fixedDeductionArray.clear();
        ctcTemplate.data.ctcTemplateFixedDeductions.forEach((fixedDeduction: any) => {
          if (fixedDeduction.criteria == 'Amount') {
            fixedDeductionArray.push(this.fb.group({
              fixedDeduction: [fixedDeduction?.fixedDeduction?._id],
              fixedDeductionLabel: [fixedDeduction?.fixedDeduction?.label],
              monthlyAmount: [fixedDeduction.value],
              yearlyAmount: [fixedDeduction.value * 12]
            }));
          }
          if (fixedDeduction.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (fixedDeduction.value / 100) * grossPay;
            fixedDeductionArray.push(this.fb.group({
              fixedDeduction: [fixedDeduction?.fixedDeduction?._id],
              fixedDeductionLabel: [fixedDeduction?.fixedDeduction?.label],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            }));
          }
        });
        this.salaryDetailsForm.setControl('salaryComponentFixedDeduction', fixedDeductionArray);

        const variableAllowanceArray = this.salaryDetailsForm.get('salaryComponentVariableAllowance') as FormArray;
        variableAllowanceArray.clear();
        ctcTemplate.data.ctcTemplateVariableAllowances.forEach((variableAllowance: any) => {
          if (variableAllowance.criteria == 'Amount') {
            variableAllowanceArray.push(this.fb.group({
              variableAllowance: [variableAllowance.variableAllowance?._id],
              variableAllowanceLabel: [variableAllowance.variableAllowance?.label],
              monthlyAmount: [variableAllowance.value],
              yearlyAmount: [variableAllowance.value * 12]
            }));
          }
          if (variableAllowance.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (variableAllowance.value / 100) * grossPay;
            variableAllowanceArray.push(this.fb.group({
              variableAllowance: [variableAllowance.variableAllowance?._id],
              variableAllowanceLabel: [variableAllowance.variableAllowance?.label],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            }));
          }
        });
        this.salaryDetailsForm.setControl('salaryComponentVariableAllowance', variableAllowanceArray);

        const variableDeductionArray = this.salaryDetailsForm.get('salaryComponentVariableDeduction') as FormArray;
        variableDeductionArray.clear();
        ctcTemplate.data.ctcTemplateVariableDeductions.forEach((variableDeduction: any) => {
          if (variableDeduction.criteria == 'Amount') {
            variableDeductionArray.push(this.fb.group({
              variableDeduction: [variableDeduction?.variableDeduction?._id],
              variableDeductionLabel: [variableDeduction?.variableDeduction?.label],
              monthlyAmount: [variableDeduction.value],
              yearlyAmount: [variableDeduction.value * 12]
            }));
          }
          if (variableDeduction.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (variableDeduction.value / 100) * grossPay;
            variableDeductionArray.push(this.fb.group({
              variableDeduction: [variableDeduction?.variableDeduction?._id],
              variableDeductionLabel: [variableDeduction?.variableDeduction?.label],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            }));
          }
        });
        this.salaryDetailsForm.setControl('salaryComponentVariableDeduction', variableDeductionArray);
        this.subscribeToFormArrayChanges();
        this.CalculateTotalAmount();
        this.calculateStatutoryComponents();
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toast.error('Error fetching CTC template:', 'Error');
      }
    );
  }

  CalculateTotalAmount() {
    const arrays = [
      'salaryComponentFixedAllowance',
      'salaryComponentFixedDeduction',
      'salaryComponentVariableAllowance',
      'salaryComponentVariableDeduction',
    ];

    let totalYearlyAmount = 0;

    arrays.forEach(arrayName => {
      const formArray = this.salaryDetailsForm.get(arrayName) as FormArray;
      formArray.controls.forEach(control => {
        const yearlyAmount = Number(control.get('yearlyAmount')?.value) || 0;
        totalYearlyAmount += yearlyAmount;
      });
    });

    this.salaryDetailsForm.get('Amount')?.setValue(totalYearlyAmount, { emitEvent: false });
    this.cdr.detectChanges();
  }

  enableManualEntry() {
    this.salaryDetailsForm.get('salaryComponentFixedAllowance').enable({ emitEvent: false });
    this.salaryDetailsForm.get('salaryComponentEmployerContribution').enable({ emitEvent: false });
    this.salaryDetailsForm.get('salaryComponentEmployeeDeduction').enable({ emitEvent: false });
    this.salaryDetailsForm.get('salaryComponentFixedDeduction').enable({ emitEvent: false });
    this.salaryDetailsForm.get('salaryComponentVariableAllowance').enable({ emitEvent: false });
    this.salaryDetailsForm.get('salaryComponentVariableDeduction').enable({ emitEvent: false });
    this.cdr.detectChanges();
  }

  getStatutorySettings() {
    let userId = this.userService.selectedEmployee.getValue().id;
    this.userService.getStatutoryByUserId(userId).subscribe((res: any) => {
      this.statutorySettings = res.data;
      this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.patchValue({
        isPFDeduction: this.statutorySettings.isEmployeeEligibleForPFDeduction,
        isEmployeePFCappedAtPFCeiling: this.statutorySettings.isEmployeePFCappedAtPFCeiling,
        isEmployerPFCappedAtPFCeiling: this.statutorySettings.isEmployerPFCappedAtPFCeiling,
        fixedAmountForProvidentFundWage: this.statutorySettings.fixedAmountForYourProvidentFundWage,
        isESICDeduction: this.statutorySettings.isESICDeductedFromSalary,
        isPTDeduction: this.statutorySettings.isTaxDeductedFromPlayslip,
        isLWFDeduction: this.statutorySettings.isLWFDeductedFromPlayslip,
        isGratuityApplicable: this.statutorySettings?.isGratuityEligible,
        isRoundOffApplicable: this.statutorySettings.roundOffApplicable,
        isIncomeTaxDeduction: this.statutorySettings?.isIncomeTaxDeducted
      }, { emitEvent: false });
      if (this.edit) {
        this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.disable({ emitEvent: false });
      }
      this.calculateStatutoryComponents();
      this.cdr.detectChanges();
    });
  }
}