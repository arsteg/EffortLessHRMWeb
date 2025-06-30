import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';

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
  ctcTemplates: any;
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
  fixedAllowance: any[] = []; // Initialize to an empty array
  employeeDeduction: any;

  view = localStorage.getItem('view');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

   private noNegativeValues(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isNegative = control.value < 0;
      return isNegative ? { 'negativeValue': { value: control.value } } : null;
    };
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private payrollService: PayrollService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.salaryDetailsForm = this.fb.group({
      user: [''],
      payrollEffectiveFrom: [''],
      frequencyToEnterCTC: [''],
      CTCTemplate: ['manual'],
      isEmployerPartInclusiveInSalaryStructure: [{ value: true, disabled: true }],
      enteringAmount: ['Yearly'],
      Amount: [0],
      totalCTCExcludingVariableAndOtherBenefits: [0],
      totalCTCIncludingVariable: [0],
      employeeSalaryTaxAndStatutorySetting: this.fb.group({
        isVariableAllowancePartOfCTC: [false],
        isPFDeduction: [false],
        isProvidentPensionDeduction: [false],
        isEmployeePFCappedAtPFCeiling: [false],
        isEmployerPFCappedAtPFCeiling: [false],
        fixedAmountForProvidentFundWage: [0],
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
    this.getAllComponents();
    this.salaryDetailsForm.get('frequencyToEnterCTC')?.setValue('Yearly');
    this.salaryDetailsForm.get('frequencyToEnterCTC')?.disable();
    if (this.edit) {
      this.getSalaryDetailsById();
      this.disableFormControls(this.salaryDetailsForm);
    }
    if (!this.edit) {
      this.payrollService.getGeneralSettings(this.selectedUser?.company?._id).subscribe((res: any) => {
        this.payrollGeneralSettings = res.data;
      });
      this.getStatutorySettings();
      this.salaryDetailsForm.patchValue({ CTCTemplate: 'manual' });
      this.addFixedAllowance();
      // this.addEmployerContribution();
      // this.addEmployeeDeduction();
      this.addFixedDeduction();
      this.addVariableAllowance();
      this.addVariableDeduction();
      this.getCTCTemplates();
      // Subscribe to changes for real-time calculations
      this.salaryDetailsForm.get('Amount')?.valueChanges.subscribe(() => {
        this.calculateStatutoryComponents();
      });
      this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.valueChanges.subscribe(() => {
        this.calculateStatutoryComponents();
      });
      this.salaryDetailsForm.get('salaryComponentFixedAllowance')?.valueChanges.subscribe(() => {
        this.calculateStatutoryComponents();
      });
      this.salaryDetailsForm.get('salaryComponentVariableAllowance')?.valueChanges.subscribe(() => {
        this.calculateStatutoryComponents();
      });
      this.salaryDetailsForm.get('salaryComponentFixedDeduction')?.valueChanges.subscribe(() => {
        this.calculateStatutoryComponents();
      });
    }
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
      employerContribution: this.payrollService.getFixedContribution({ next: '', skip: '' }),
      employeeDeduction: this.payrollService.getFixedDeduction({ next: '', skip: '' }),
      fixedDeduction: this.payrollService.getFixedDeduction({ next: '', skip: '' }),
      variableAllowance: this.payrollService.getVariableAllowance({ next: '', skip: '' }),
      variableDeduction: this.payrollService.getVariableDeduction({ next: '', skip: '' }),
    }).subscribe(result => {
      this.fixedAllowance = result.fixedAllowance.data;
      this.employerContribution = result.employerContribution.data;
      this.employeeDeduction = result.employeeDeduction.data;
      this.fixedDeduction = result.fixedDeduction.data;
      this.variableAllowance = result.variableAllowance.data;
      this.variableDeduction = result.variableDeduction.data;
      // Note: Do not patch entire arrays directly here. Use this data for dropdown options.
      // The form arrays should be built programmatically with addFixedAllowance, etc.
    });
  }

  onCTCTemplateChange(value: string): void {
    if (value === 'manual') {
      this.enableManualEntry();
      // Initialize form arrays if needed
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
  }

  disableFormControls(formGroup: FormGroup | FormArray) {
    if (formGroup instanceof FormGroup) {
      formGroup.disable();
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.disableFormControls(control);
        } else {
          control.disable();
        }
      });
    } else if (formGroup instanceof FormArray) {
      formGroup.controls.forEach(control => this.disableFormControls(control as FormGroup));
      formGroup.disable();
    }
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

  // Helper method to get selected IDs for a specific FormArray and control name
  private getSelectedIds(formArray: FormArray, controlName: string): string[] {
    return formArray.controls
      .map(control => control.get(controlName)?.value)
      .filter(value => value !== null && value !== undefined && value !== '');
  }

  // Method to check if an option should be disabled for a given FormArray
  isOptionDisabled(optionId: string, currentIndex: number, formArray: FormArray, controlName: string): boolean {
    const selectedIds = this.getSelectedIds(formArray, controlName);
    // Disable if the option is already selected in another row
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
        return; // Or throw an error if an unknown type is passed
    }

    const control = formArray.at(index);
    const selectedItem = itemsList.find(item => item._id === value);
    if (selectedItem) {
      control.patchValue({ [labelControlName]: selectedItem.label });
    }
  }

  updateYearlyAmount(index: number, formArrayName: string): void {
    const array = this.salaryDetailsForm.get(formArrayName) as FormArray;
    const control = array.at(index);
    const monthly = control.get('monthlyAmount').value;

    // Ensure monthly is not negative before calculating yearly
    if (monthly >= 0) {
      control.patchValue({ yearlyAmount: monthly * 12 });
    } else {
      // Optionally, set yearlyAmount to 0 or handle the error
      control.patchValue({ yearlyAmount: 0 });
    }
    this.CalculateTotalAmount();
  }


  addFixedAllowance(): void {
    const allowanceGroup = this.fb.group({
      fixedAllowanceLabel: [''],
      fixedAllowance: ['', Validators.required],
      monthlyAmount: [0, [Validators.required, this.noNegativeValues()]], // Add custom validator here
      yearlyAmount: [0, [Validators.required, this.noNegativeValues()]],
      isNew: [true]
    });
    this.fixedAllowances.push(allowanceGroup);
  }
  removeFixedAllowance(index: number): void {
    this.fixedAllowances.removeAt(index);
    this.CalculateTotalAmount();
  }

  addFixedDeduction(): void {
    const allowanceGroup = this.fb.group({
      fixedDeduction: ['', Validators.required],
      fixedDeductionLabel: [''],
      monthlyAmount: [0, [Validators.required, this.noNegativeValues()]], // Add custom validator here
      yearlyAmount: [0, [Validators.required, this.noNegativeValues()]],
      isNew: [true]
    });
    this.fixedDeductionArray.push(allowanceGroup);
  }
  removeFixedDeduction(index: number): void {
    this.fixedDeductionArray.removeAt(index);
    this.CalculateTotalAmount();
  }

  addVariableAllowance(): void {
    const allowanceGroup = this.fb.group({
      variableAllowance: ['', Validators.required],
      variableAllowanceLabel: [''],
      monthlyAmount: [0, [Validators.required, this.noNegativeValues()]], // Add custom validator here
      yearlyAmount: [0, [Validators.required, this.noNegativeValues()]],
      isNew: [true]
    });
    this.variableAllowanceArray.push(allowanceGroup);
  }
  removeVariableAllowance(index: number): void {
    this.variableAllowanceArray.removeAt(index);
    this.CalculateTotalAmount();
  }

  addVariableDeduction(): void {
    const allowanceGroup = this.fb.group({
      variableDeduction: ['', Validators.required],
      variableDeductionLabel: [''],
      monthlyAmount: [0, [Validators.required, this.noNegativeValues()]], // Add custom validator here
      yearlyAmount: [0, [Validators.required, this.noNegativeValues()]],
      isNew: [true]
    });
    this.variableDeductionArray.push(allowanceGroup);
  }
  removeVariableDeduction(index: number): void {
    this.variableDeductionArray.removeAt(index);
    this.CalculateTotalAmount();
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
    if (this.ctcTemplates && this.salaryDetailsForm.get('CTCTemplate').value !== 'manual') {
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

    // Employee Deductions from CTC Template
    const employeeDeductionArray = this.salaryDetailsForm.get('salaryComponentEmployeeDeduction') as FormArray;
    employeeDeductionArray.clear();
    if (this.ctcTemplates && this.salaryDetailsForm.get('CTCTemplate').value !== 'manual') {
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
  }

  onSubmissionSalaryDetails(): void {
    const payload = this.salaryDetailsForm.value;
    this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.enable();
    payload.employeeSalaryTaxAndStatutorySetting = [this.employeeSalaryTaxAndStatutorySetting.value];
    payload.user = this.userService.selectedEmployee.getValue().id;

    // Map form arrays
    payload.salaryComponentFixedAllowance = payload.salaryComponentFixedAllowance.map(item => ({
      fixedAllowance: item.fixedAllowance,
      monthlyAmount: item.monthlyAmount || 0,
      yearlyAmount: item.yearlyAmount || 0
    }));

    payload.salaryComponentEmployerContribution = payload.salaryComponentEmployerContribution.map(item => ({
      employerContribution: item.employerContribution,
      monthlyAmount: item.monthlyAmount || 0,
      yearlyAmount: item.yearlyAmount || 0
    }));

    payload.salaryComponentEmployeeDeduction = payload.salaryComponentEmployeeDeduction.map(item => ({
      employeeDeduction: item.employeeDeduction,
      monthlyAmount: item.monthlyAmount || 0,
      yearlyAmount: item.yearlyAmount || 0
    }));

    payload.salaryComponentFixedDeduction = payload.salaryComponentFixedDeduction.map(item => ({
      fixedDeduction: item.fixedDeduction,
      monthlyAmount: item.monthlyAmount || 0,
      yearlyAmount: item.yearlyAmount || 0
    }));

    payload.salaryComponentVariableAllowance = payload.salaryComponentVariableAllowance.map(item => ({
      variableAllowance: item.variableAllowance,
      monthlyAmount: item.monthlyAmount || 0,
      yearlyAmount: item.yearlyAmount || 0
    }));

    payload.salaryComponentVariableDeduction = payload.salaryComponentVariableDeduction.map(item => ({
      variableDeduction: item.variableDeduction,
      monthlyAmount: item.monthlyAmount || 0,
      yearlyAmount: item.yearlyAmount || 0
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

  getCTCTemplates() {
    let payload = { next: '', skip: '' };
    this.payrollService.getCTCTemplate(payload).subscribe((res: any) => {
      this.ctcTemplates = res.data;
    });
  }

  getCTCTemplateById(id: string): void {
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

        const employerContributionArray = this.salaryDetailsForm.get('salaryComponentEmployerContribution') as FormArray;
        employerContributionArray.clear();
        ctcTemplate.data.ctcTemplateEmployerContributions.forEach((fixedContribution: any) => {
          employerContributionArray.push(this.fb.group({
            employerContribution: [fixedContribution?.fixedContribution?._id],
            employerContributionLabel: [fixedContribution?.fixedContribution?.label],
            monthlyAmount: [fixedContribution.value || 0],
            yearlyAmount: [(fixedContribution.value || 0) * 12]
          }));
        });
        this.salaryDetailsForm.setControl('salaryComponentEmployerContribution', employerContributionArray);

        const employeeDeductionArray = this.salaryDetailsForm.get('salaryComponentEmployeeDeduction') as FormArray;
        employeeDeductionArray.clear();
        ctcTemplate.data.ctcTemplateEmployerContributions.forEach((fixedContribution: any) => {
          employeeDeductionArray.push(this.fb.group({
            employeeDeduction: [fixedContribution?.fixedContribution?._id],
            employeeDeductionLabel: [fixedContribution?.fixedContribution?.label],
            monthlyAmount: [fixedContribution.value || 0],
            yearlyAmount: [(fixedContribution.value || 0) * 12]
          }));
        });
        this.salaryDetailsForm.setControl('salaryComponentEmployeeDeduction', employeeDeductionArray);

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
        this.CalculateTotalAmount();
        this.calculateStatutoryComponents(); // Recalculate after loading template
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
        const yearlyAmount = control.get('yearlyAmount')?.value || 0;
        totalYearlyAmount += yearlyAmount;
      });
    });
    this.salaryDetailsForm.get('Amount')?.setValue(totalYearlyAmount);
  }
  getSalaryDetailsById() {
    let id = this.selectedSalaryDetail._id;
    this.userService.getSalaryDetailsById(id).subscribe((res: any) => {
      this.salaryDetails = res.data;
      this.salaryDetailsForm.patchValue(res.data);

      const taxAndStatutorySettingGroup = this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting') as FormGroup;
      taxAndStatutorySettingGroup.patchValue(res.data.taxAndSalutaorySetting[0]);

      const salaryComponentFixedAllowance = res.data.fixedAllowanceList;
      this.fixedAllowances.clear();
      salaryComponentFixedAllowance.forEach((allowance) => {
        this.addFixedAllowance();
        this.fixedAllowances.at(this.fixedAllowances.length - 1).patchValue(allowance);
      });

      const salaryComponentFixedDeduction = res.data.fixedDeductionList;
      this.fixedDeductionArray.clear();
      salaryComponentFixedDeduction.forEach((benefit) => {
        this.addFixedDeduction();
        this.fixedDeductionArray.at(this.fixedDeductionArray.length - 1).patchValue(benefit);
      });

      const salaryComponentVariableAllowance = res.data.variableAllowanceList;
      this.variableAllowanceArray.clear();
      salaryComponentVariableAllowance.forEach((benefit) => {
        this.addVariableAllowance();
        this.variableAllowanceArray.at(this.variableAllowanceArray.length - 1).patchValue(benefit);
      });

      const salaryComponentVariableDeduction = res.data.variableDeductionList;
      this.variableDeductionArray.clear();
      salaryComponentVariableDeduction.forEach((benefit) => {
        this.addVariableDeduction();
        this.variableDeductionArray.at(this.variableDeductionArray.length - 1).patchValue(benefit);
      });
    });
  }

  enableManualEntry() {
    this.salaryDetailsForm.get('salaryComponentFixedAllowance').enable();
    this.salaryDetailsForm.get('salaryComponentEmployerContribution').enable();
    this.salaryDetailsForm.get('salaryComponentEmployeeDeduction').enable();
    this.salaryDetailsForm.get('salaryComponentFixedDeduction').enable();
    this.salaryDetailsForm.get('salaryComponentVariableAllowance').enable();
    this.salaryDetailsForm.get('salaryComponentVariableDeduction').enable();
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
        isIncomeTaxDeduction: this.payrollGeneralSettings?.isAllowTDSFromEffortlessHRM
      });
      this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.disable();
      this.calculateStatutoryComponents();
    });
  }
}