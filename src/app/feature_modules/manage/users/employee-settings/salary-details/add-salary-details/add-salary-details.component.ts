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
  otherBenefits: any;
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
  fixedAllowance: any;
  employeeDeduction: any;

  view = localStorage.getItem('view');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

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
      actualEffectiveDate: [''],
      frequencyToEnterCTC: [''],
      CTCTemplate: ['manual'],
      isEmployerPartInclusiveInSalaryStructure: [{ value: true, disabled: true }],
      enteringAmount: ['Yearly'],
      Amount: [0],
      BasicSalary: [0],
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
      salaryComponentOtherBenefits: this.fb.array([]),
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
    this.salaryDetailsForm.get('BasicSalary')?.disable();
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
      this.addOtherBenefit();
      // this.addEmployerContribution();
      // this.addEmployeeDeduction();
      this.addFixedDeduction();
      this.addVariableAllowance();
      this.addVariableDeduction();
      // this.addPFCharge();
      this.getCTCTemplates();

      this.salaryDetailsForm.get('Amount').valueChanges.subscribe((amount) => {
        const ctcTemplateId = this.salaryDetailsForm.get('CTCTemplate').value;
        if (ctcTemplateId && ctcTemplateId !== 'manual') {
          this.getCTCTemplateById(ctcTemplateId);
        }
      });
      this.salaryDetailsForm.get('Amount')?.valueChanges.subscribe((amount) => {
        const basicSalary = amount ? (amount * 0.4) / 12 : 0;
        this.salaryDetailsForm.get('BasicSalary')?.setValue(basicSalary, { emitEvent: false });
      });

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
      'salaryComponentOtherBenefits',
      'salaryComponentFixedDeduction',
      'salaryComponentVariableAllowance',
      'salaryComponentVariableDeduction',
    ];

    let totalYearlyAmount = 0;
    const basicSalary = grossSalary * 0.4;
    totalYearlyAmount += basicSalary;

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
      otherBenefits: this.payrollService.getOtherBenefits({ next: '', skip: '' }),
      employerContribution: this.payrollService.getFixedContribution({ next: '', skip: '' }),
      employeeDeduction: this.payrollService.getFixedDeduction({ next: '', skip: '' }),
      fixedDeduction: this.payrollService.getFixedDeduction({ next: '', skip: '' }),
      variableAllowance: this.payrollService.getVariableAllowance({ next: '', skip: '' }),
      variableDeduction: this.payrollService.getVariableDeduction({ next: '', skip: '' }),
    }).subscribe(result => {
      this.fixedAllowance = result.fixedAllowance.data;
      this.otherBenefits = result.otherBenefits.data;
      this.employerContribution = result.employerContribution.data;
      this.employeeDeduction = result.employeeDeduction.data;
      this.fixedDeduction = result.fixedDeduction.data;
      this.variableAllowance = result.variableAllowance.data;
      this.variableDeduction = result.variableDeduction.data;
      this.salaryDetailsForm.patchValue({
        salaryComponentFixedAllowance: this.fixedAllowance,
        salaryComponentOtherBenefits: this.otherBenefits,
        salaryComponentEmployerContribution: this.employerContribution,
        salaryComponentEmployeeDeduction: this.employeeDeduction,
        salaryComponentFixedDeduction: this.fixedDeduction,
        salaryComponentVariableAllowance: this.variableAllowance,
        salaryComponentVariableDeduction: this.variableDeduction,
        salaryComponentPFCharge: this.pfCharge,
      });
    });
  }

  onCTCTemplateChange(value: string): void {
    if (value === 'manual') {
      this.enableManualEntry();
      // Initialize form arrays if needed
      if (this.fixedAllowances.length === 0) {
        this.addFixedAllowance();
      }
      if (this.otherBenefitsArray.length === 0) {
        this.addOtherBenefit();
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
      this.otherBenefitsArray.clear();
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

  get otherBenefitsArray(): FormArray {
    return this.salaryDetailsForm.get('salaryComponentOtherBenefits') as FormArray;
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
  
  // get employerContributionArray(): FormArray {
  //   return this.salaryDetailsForm.get('salaryComponentEmployerContribution') as FormArray;
  // }

  // get employeeDeductionArray(): FormArray {
  //   return this.salaryDetailsForm.get('salaryComponentEmployeeDeduction') as FormArray;
  // }
  // get pfChargeArray(): FormArray {
  //   return this.salaryDetailsForm.get('salaryComponentPFCharge') as FormArray;
  // }

  handleMonthlyAmountChanges() {
    const arrays = [
      this.otherBenefitsArray,
      // this.employerContributionArray,
      // this.employeeDeductionArray
    ];
    arrays.forEach(array => {
      array.controls.forEach((group: FormGroup) => {
        const monthlyControl = group.get('monthlyAmount');
        const yearlyControl = group.get('yearlyAmount');
        if (monthlyControl && yearlyControl) {
          monthlyControl.valueChanges.subscribe((monthlyAmount) => {
            if (monthlyAmount && !isNaN(monthlyAmount)) {
              yearlyControl.setValue(monthlyAmount * 12, { emitEvent: false });
            }
          });
        }
      });
    });
  }
  updateLabel(index: number, value: string, type: string): void {
    const array = this.salaryDetailsForm.get(`salaryComponent${type.charAt(0).toUpperCase() + type.slice(1)}`) as FormArray;
    const control = array.at(index);
    const selectedItem = this[type].find(item => item._id === value);
    if (selectedItem) {
      control.patchValue({ [`${type}Label`]: selectedItem.label });
    }
  }
  updateYearlyAmount(index: number, formArrayName: string): void {
    const array = this.salaryDetailsForm.get(formArrayName) as FormArray;
    const control = array.at(index);
    const monthly = control.get('monthlyAmount').value;
    control.patchValue({ yearlyAmount: monthly * 12 });
  }
  addFixedAllowance(): void {
    const allowanceGroup = this.fb.group({
      fixedAllowanceLabel: [''],
      fixedAllowance: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.fixedAllowances.push(allowanceGroup);
  }
  removeFixedAllowance(index: number): void {
    this.fixedAllowances.removeAt(index);
  }

  addOtherBenefit(): void {
    const allowanceGroup = this.fb.group({
      otherBenefits: ['', Validators.required],
      otherBenefitsLabel: [''],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.otherBenefitsArray.push(allowanceGroup);
  }
  removeOtherBenefit(index: number): void {
    this.otherBenefitsArray.removeAt(index);
  }
  
  addFixedDeduction(): void {
    const allowanceGroup = this.fb.group({
      fixedDeduction: ['', Validators.required],
      fixedDeductionLabel: [''],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.fixedDeductionArray.push(allowanceGroup);
  }
  removeFixedDeduction(index: number): void {
    this.fixedDeductionArray.removeAt(index);
  }
  
  addVariableAllowance(): void {
    const allowanceGroup = this.fb.group({
      variableAllowance: ['', Validators.required],
      variableAllowanceLabel: [''],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.variableAllowanceArray.push(allowanceGroup);
  }
  removeVariableAllowance(index: number): void {
    this.variableAllowanceArray.removeAt(index);
  }
  
  addVariableDeduction(): void {
    const allowanceGroup = this.fb.group({
      variableDeduction: ['', Validators.required],
      variableDeductionLabel: [''],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.variableDeductionArray.push(allowanceGroup);
  }
  removeVariableDeduction(index: number): void {
    this.variableDeductionArray.removeAt(index);
  }
  
  // addEmployerContribution(): void {
  //   const allowanceGroup = this.fb.group({
  //     employerContribution: ['', Validators.required],
  //     employerContributionLabel: [''],
  //     monthlyAmount: [0, Validators.required],
  //     yearlyAmount: [0, Validators.required]
  //   });
    // this.employerContributionArray.push(allowanceGroup);
  // }

  // addEmployeeDeduction(): void {
  //   const deductionGroup = this.fb.group({
  //     employeeDeduction: ['', Validators.required],
  //     employeeDeductionLabel: [''],
  //     monthlyAmount: [0, Validators.required],
  //     yearlyAmount: [0, Validators.required]
  //   });
    // this.employeeDeductionArray.push(deductionGroup);
  // }
  // addPFCharge(): void {
  //   const allowanceGroup = this.fb.group({
  //     pfCharge: ['', Validators.required],
  //     monthlyAmount: [0, Validators.required],
  //     yearlyAmount: [0, Validators.required]
  //   });
    // this.pfChargeArray.push(allowanceGroup);
  // }

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
    this.handleMonthlyAmountChanges(); // Ensure yearly amounts update
  }

  onSubmissionSalaryDetails(): void {
    this.salaryDetailsForm.get('BasicSalary').enable();
    this.salaryDetailsForm.get('BasicSalary')?.setValue((this.salaryDetailsForm.get('Amount')?.value * 0.4) / 12);
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

    payload.salaryComponentOtherBenefits = payload.salaryComponentOtherBenefits.map(item => ({
      otherBenefits: item.otherBenefits,
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
    payload.BasicSalary = payload.Amount * 0.4;

    this.userService.addSalaryDetails(payload).subscribe(
      (res: any) => {
        this.toast.success('The salary details have been successfully added.');
      },
      err => {
        this.toast.error('The salary details cannot be added', 'Error');
      }
    );
    this.salaryDetailsForm.get('BasicSalary')?.disable();
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

        const otherBenefitsArray = this.salaryDetailsForm.get('salaryComponentOtherBenefits') as FormArray;
        otherBenefitsArray.clear();
        ctcTemplate.data.ctcTemplateOtherBenefitAllowances.forEach((otherBenefit: any) => {
          otherBenefitsArray.push(this.fb.group({
            otherBenefits: [otherBenefit?.otherBenefit?._id],
            otherBenefitsLabel: [otherBenefit?.otherBenefit?.label],
            monthlyAmount: [otherBenefit?.value],
            yearlyAmount: [otherBenefit?.value * 12]
          }));
        });
        this.salaryDetailsForm.setControl('salaryComponentOtherBenefits', otherBenefitsArray);

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

        this.calculateStatutoryComponents(); // Recalculate after loading template
      },
      (error: any) => {
        this.toast.error('Error fetching CTC template:', 'Error');
      }
    );
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

      const salaryComponentOtherBenefits = res.data.otherBenefitList;
      this.otherBenefitsArray.clear();
      salaryComponentOtherBenefits.forEach((benefit) => {
        this.addOtherBenefit();
        this.otherBenefitsArray.at(this.otherBenefitsArray.length - 1).patchValue(benefit);
      });

      // const salaryComponentEmployerContribution = res.data.employerContributionList;
      // this.employerContributionArray.clear();
      // salaryComponentEmployerContribution.forEach((benefit) => {
      //   this.addEmployerContribution();
      //   this.employerContributionArray.at(this.employerContributionArray.length - 1).patchValue(benefit);
      // });

      // const salaryComponentEmployeeDeduction = res.data.employeeDeductionList || [];
      // this.employeeDeductionArray.clear();
      // salaryComponentEmployeeDeduction.forEach((deduction) => {
      //   this.addEmployeeDeduction();
      //   this.employeeDeductionArray.at(this.employeeDeductionArray.length - 1).patchValue(deduction);
      // });

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

      // const salaryComponentPFCharge = res.data.salaryComponentPFCharge;
      // this.pfChargeArray.clear();
      // salaryComponentPFCharge.forEach((benefit) => {
      //   this.addPFCharge();
      //   this.pfChargeArray.at(this.pfChargeArray.length - 1).patchValue(benefit);
      // });
    });
  }

 

  enableManualEntry() {
    this.salaryDetailsForm.get('salaryComponentFixedAllowance').enable();
    this.salaryDetailsForm.get('salaryComponentOtherBenefits').enable();
    this.salaryDetailsForm.get('salaryComponentEmployerContribution').enable();
    this.salaryDetailsForm.get('salaryComponentEmployeeDeduction').enable();
    this.salaryDetailsForm.get('salaryComponentFixedDeduction').enable();
    this.salaryDetailsForm.get('salaryComponentVariableAllowance').enable();
    this.salaryDetailsForm.get('salaryComponentVariableDeduction').enable();
    this.salaryDetailsForm.get('salaryComponentPFCharge').enable();
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