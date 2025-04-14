import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
      isEmployerPartInclusiveInSalaryStructure: [false],
      enteringAmount: ['Yearly'],
      Amount: [0],
      BasicSalary: [0],
      totalCTCExcludingVariableAndOtherBenefits: [0],
      totalCTCIncludingVariable: [0],
      employeeSalaryTaxAndStatutorySetting: this.fb.group({
        isVariableAllowancePartOfCTC: [false],
        isPFDeduction: [false],
        isProvidentPensionDeduction: [false],
        isEmployeeProvidentFundCappedAtPFCeiling: [false],
        isEmployerProvidentFundCappedAtPFCeiling: [false],
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
      salaryComponentEmployeeDeduction: this.fb.array([]), // New FormArray for employee deductions
      salaryComponentFixedDeduction: this.fb.array([]),
      salaryComponentVariableAllowance: this.fb.array([]),
      salaryComponentVariableDeduction: this.fb.array([]),
      salaryComponentPFCharge: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.getAllPFCharges();
    this.salaryDetailsForm.get('salaryComponentPFCharge')?.valueChanges.subscribe(() => {
      this.updateYearlyAmount();
    });
    this.salaryDetailsForm.get('frequencyToEnterCTC')?.setValue('Yearly');
    this.salaryDetailsForm.get('frequencyToEnterCTC')?.disable();
    this.salaryDetailsForm.get('BasicSalary')?.disable();
    this.logUrlSegmentsForUser();
    if (this.edit) {
      this.getSalaryDetailsById();
      this.disableFormControls(this.salaryDetailsForm);
    }
    if (!this.edit) {
      this.getStatutorySettings();
      this.salaryDetailsForm.patchValue({ CTCTemplate: 'manual' });
      this.addFixedAllowance();
      this.addOtherBenefit();
      this.addEmployerContribution();
      this.addEmployeeDeduction(); // Initialize employee deduction
      this.addFixedDeduction();
      this.addVariableAllowance();
      this.addVariableDeduction();
      this.addPFCharge();
      this.getCTCTemplates();

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

  getAllPFCharges() {
    let payload = { skip: '', next: '' };
    this.payrollService.getAllPFCharges(payload).subscribe((res: any) => {
      this.pfCharge = res.data;
    });
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

  get employerContributionArray(): FormArray {
    return this.salaryDetailsForm.get('salaryComponentEmployerContribution') as FormArray;
  }

  get employeeDeductionArray(): FormArray {
    return this.salaryDetailsForm.get('salaryComponentEmployeeDeduction') as FormArray;
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

  get pfChargeArray(): FormArray {
    return this.salaryDetailsForm.get('salaryComponentPFCharge') as FormArray;
  }

  updateYearlyAmount() {
    const salaryComponentPFCharge = this.salaryDetailsForm.get('salaryComponentPFCharge') as FormArray;
    salaryComponentPFCharge.controls.forEach((group: FormGroup) => {
      const monthlyAmount = group.get('monthlyAmount')?.value || 0;
      group.get('yearlyAmount')?.setValue(monthlyAmount * 12, { emitEvent: false });
    });
  }

  handleMonthlyAmountChanges() {
    const arrays = [
      this.otherBenefitsArray,
      this.employerContributionArray,
      this.employeeDeductionArray // Added for employee deductions
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

  addFixedAllowance(): void {
    const allowanceGroup = this.fb.group({
      fixedAllowanceLabel: [''],
      fixedAllowance: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.fixedAllowances.push(allowanceGroup);
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

  addEmployerContribution(): void {
    const allowanceGroup = this.fb.group({
      employerContribution: ['', Validators.required],
      employerContributionLabel: [''],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.employerContributionArray.push(allowanceGroup);
  }

  addEmployeeDeduction(): void {
    const deductionGroup = this.fb.group({
      employeeDeduction: ['', Validators.required],
      employeeDeductionLabel: [''],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.employeeDeductionArray.push(deductionGroup);
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

  addVariableAllowance(): void {
    const allowanceGroup = this.fb.group({
      variableAllowance: ['', Validators.required],
      variableAllowanceLabel: [''],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.variableAllowanceArray.push(allowanceGroup);
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

  addPFCharge(): void {
    const allowanceGroup = this.fb.group({
      pfCharge: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required]
    });
    this.pfChargeArray.push(allowanceGroup);
  }

  logUrlSegmentsForUser() {
    const urlPath = this.router.url;
    const segments = urlPath.split('/').filter(segment => segment);
    if (segments.length >= 3) {
      const employee = segments[segments.length - 3];
      this.userService.getUserByEmpCode(employee).subscribe((res: any) => {
        this.selectedUser = res.data;
      });
    }
  }

  calculateStatutoryComponents(): void {
    const ctc = this.salaryDetailsForm.get('Amount')?.value || 0;
    const basicSalary = (ctc * 0.4) / 12; // Monthly basic (40% of CTC)
    const statutorySettings = this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.value;
    const grossSalary = this.calculateGrossSalary();

    // Employer Contributions
    const employerContributionArray = this.salaryDetailsForm.get('salaryComponentEmployerContribution') as FormArray;
    employerContributionArray.clear();

    if (statutorySettings.isPFDeduction) {
      let pfWage = basicSalary;
      if (statutorySettings.fixedAmountForProvidentFundWage) {
        pfWage = statutorySettings.fixedAmountForProvidentFundWage;
      } else if (statutorySettings.isEmployerProvidentFundCappedAtPFCeiling) {
        pfWage = Math.min(pfWage, 15000);
      }
      const monthlyPf = pfWage * 0.12;
      employerContributionArray.push(this.fb.group({
        employerContribution: ['pf'],
        employerContributionLabel: ['Provident Fund'],
        monthlyAmount: [monthlyPf],
        yearlyAmount: [monthlyPf * 12]
      }));
    }

    if (statutorySettings.isGratuityApplicable) {
      const monthlyGratuity = basicSalary * 0.0481;
      employerContributionArray.push(this.fb.group({
        employerContribution: ['gratuity'],
        employerContributionLabel: ['Gratuity'],
        monthlyAmount: [monthlyGratuity],
        yearlyAmount: [monthlyGratuity * 12]
      }));
    }

    if (statutorySettings.isESICDeduction && grossSalary <= 21000) {
      const monthlyEsi = grossSalary * 0.0325;
      employerContributionArray.push(this.fb.group({
        employerContribution: ['esi'],
        employerContributionLabel: ['ESI'],
        monthlyAmount: [monthlyEsi],
        yearlyAmount: [monthlyEsi * 12]
      }));
    }

    this.salaryDetailsForm.setControl('salaryComponentEmployerContribution', employerContributionArray);

    // Employee Deductions
    const employeeDeductionArray = this.salaryDetailsForm.get('salaryComponentEmployeeDeduction') as FormArray;
    employeeDeductionArray.clear();

    if (statutorySettings.isPFDeduction) {
      let pfWage = basicSalary;
      if (statutorySettings.fixedAmountForProvidentFundWage) {
        pfWage = statutorySettings.fixedAmountForProvidentFundWage;
      } else if (statutorySettings.isEmployeeProvidentFundCappedAtPFCeiling) {
        pfWage = Math.min(pfWage, 15000);
      }
      const monthlyPf = pfWage * 0.12;
      employeeDeductionArray.push(this.fb.group({
        employeeDeduction: ['pf'],
        employeeDeductionLabel: ['Provident Fund'],
        monthlyAmount: [monthlyPf],
        yearlyAmount: [monthlyPf * 12]
      }));
    }

    if (statutorySettings.isESICDeduction && grossSalary <= 21000) {
      const monthlyEsi = grossSalary * 0.0075;
      employeeDeductionArray.push(this.fb.group({
        employeeDeduction: ['esi'],
        employeeDeductionLabel: ['ESI'],
        monthlyAmount: [monthlyEsi],
        yearlyAmount: [monthlyEsi * 12]
      }));
    }

    if (statutorySettings.isPTDeduction) {
      const monthlyPt = grossSalary > 15000 ? 200 : 0; // Karnataka PT example
      employeeDeductionArray.push(this.fb.group({
        employeeDeduction: ['pt'],
        employeeDeductionLabel: ['Professional Tax'],
        monthlyAmount: [monthlyPt],
        yearlyAmount: [monthlyPt * 12]
      }));
    }

    if (statutorySettings.isLWFDeduction) {
      const monthlyLwf = 20;
      employeeDeductionArray.push(this.fb.group({
        employeeDeduction: ['lwf'],
        employeeDeductionLabel: ['Labour Welfare Fund'],
        monthlyAmount: [monthlyLwf],
        yearlyAmount: [monthlyLwf * 12]
      }));
    }

    if (statutorySettings.isIncomeTaxDeduction) {
      const monthlyTax = this.calculateIncomeTax(grossSalary * 12);
      employeeDeductionArray.push(this.fb.group({
        employeeDeduction: ['incomeTax'],
        employeeDeductionLabel: ['Income Tax'],
        monthlyAmount: [monthlyTax],
        yearlyAmount: [monthlyTax * 12]
      }));
    }

    this.salaryDetailsForm.setControl('salaryComponentEmployeeDeduction', employeeDeductionArray);
    this.handleMonthlyAmountChanges(); // Ensure yearly amounts update
  }

  calculateGrossSalary(): number {
    const ctc = this.salaryDetailsForm.get('Amount')?.value || 0;
    const isEmployerPartInclusive = this.salaryDetailsForm.get('isEmployerPartInclusiveInSalaryStructure')?.value;
    const basicSalary = (ctc * 0.4) / 12;
    let gross = basicSalary;

    // Add fixed allowances
    const fixedAllowances = this.salaryDetailsForm.get('salaryComponentFixedAllowance')?.value;
    fixedAllowances.forEach(allowance => {
      gross += allowance.monthlyAmount || 0;
    });

    // Add variable allowances if part of CTC
    if (this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting.isVariableAllowancePartOfCTC')?.value) {
      const variableAllowances = this.salaryDetailsForm.get('salaryComponentVariableAllowance')?.value;
      variableAllowances.forEach(allowance => {
        gross += allowance.monthlyAmount || 0;
      });
    }

    // Subtract fixed deductions
    const fixedDeductions = this.salaryDetailsForm.get('salaryComponentFixedDeduction')?.value;
    fixedDeductions.forEach(deduction => {
      gross -= deduction.monthlyAmount || 0;
    });

    // Adjust for employer contributions if not inclusive
    if (!isEmployerPartInclusive) {
      const employerContributions = this.salaryDetailsForm.get('salaryComponentEmployerContribution')?.value;
      let totalContributions = 0;
      employerContributions.forEach(contribution => {
        totalContributions += contribution.monthlyAmount || 0;
      });
      gross = (ctc / 12 - totalContributions);
    }

    return gross;
  }

  calculateIncomeTax(grossSalary: number): number {
    const exemptions = this.calculateExemptions();
    const taxableIncome = grossSalary - exemptions;
    let tax = 0;

    // New tax regime (FY 2025-26)
    if (taxableIncome > 300000) {
      tax += Math.min(taxableIncome, 700000) > 300000 ? (Math.min(taxableIncome, 700000) - 300000) * 0.05 : 0;
      tax += taxableIncome > 700000 ? (Math.min(taxableIncome, 1000000) - 700000) * 0.10 : 0;
      tax += taxableIncome > 1000000 ? (Math.min(taxableIncome, 1200000) - 1000000) * 0.15 : 0;
      tax += taxableIncome > 1200000 ? (taxableIncome - 1200000) * 0.20 : 0;
    }

    tax += tax * 0.04; // 4% cess
    return tax / 12; // Monthly tax
  }

  calculateExemptions(): number {
    let exemptions = 50000; // Standard deduction
    const fixedAllowances = this.salaryDetailsForm.get('salaryComponentFixedAllowance')?.value;
    fixedAllowances.forEach(allowance => {
      if (allowance.fixedAllowanceLabel.toLowerCase().includes('hra')) {
        exemptions += allowance.yearlyAmount * 0.4; // Simplified HRA exemption
      } else if (allowance.fixedAllowanceLabel.toLowerCase().includes('conveyance')) {
        exemptions += Math.min(allowance.yearlyAmount, 19200);
      } else if (allowance.fixedAllowanceLabel.toLowerCase().includes('medical')) {
        exemptions += Math.min(allowance.yearlyAmount, 15000);
      }
    });
    const employeeDeductions = this.salaryDetailsForm.get('salaryComponentEmployeeDeduction')?.value;
    employeeDeductions.forEach(deduction => {
      if (deduction.employeeDeduction === 'pf') {
        exemptions += deduction.yearlyAmount || 0;
      }
    });
    return exemptions;
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
            monthlyAmount: [0],
            yearlyAmount: [0]
          }));
        });
        this.salaryDetailsForm.setControl('salaryComponentEmployerContribution', employerContributionArray);

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

      const salaryComponentEmployerContribution = res.data.employerContributionList;
      this.employerContributionArray.clear();
      salaryComponentEmployerContribution.forEach((benefit) => {
        this.addEmployerContribution();
        this.employerContributionArray.at(this.employerContributionArray.length - 1).patchValue(benefit);
      });

      const salaryComponentEmployeeDeduction = res.data.employeeDeductionList || [];
      this.employeeDeductionArray.clear();
      salaryComponentEmployeeDeduction.forEach((deduction) => {
        this.addEmployeeDeduction();
        this.employeeDeductionArray.at(this.employeeDeductionArray.length - 1).patchValue(deduction);
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

      const salaryComponentPFCharge = res.data.salaryComponentPFCharge;
      this.pfChargeArray.clear();
      salaryComponentPFCharge.forEach((benefit) => {
        this.addPFCharge();
        this.pfChargeArray.at(this.pfChargeArray.length - 1).patchValue(benefit);
      });
    });
  }

  onCTCTemplateChange(value: string) {
    if (value === 'manual') {
      this.addButtons = true;
      this.enableManualEntry();
    } else {
      this.addButtons = false;
      this.getCTCTemplateById(value);
    }
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
      this.statutorySettings = res.data[0];
      this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.patchValue({
        isPFDeduction: this.statutorySettings.isEmployeeEligibleForProvidentFundDeduction,
        isEmployeeProvidentFundCappedAtPFCeiling: this.statutorySettings.willEmployeeProvidentFundContributionCappedAtProvidentFundCeiling,
        isEmployerProvidentFundCappedAtPFCeiling: this.statutorySettings.willEmployerProvidentFundContributionBeCappedAtProvidentFundCeiling,
        fixedAmountForProvidentFundWage: this.statutorySettings.fixedAmountForYourProvidentFundWage,
        isESICDeduction: this.statutorySettings.isESICDeductedFromSalary,
        isPTDeduction: this.statutorySettings.isTaxDeductedFromPlayslip,
        isLWFDeduction: this.statutorySettings.isLWFDeductedFromPlayslip,
        isGratuityApplicable: this.statutorySettings.isGratuityEligible,
        isIncomeTaxDeduction: this.statutorySettings.isIncomeTaxDeducted,
        isRoundOffApplicable: this.statutorySettings.roundOffApplicable
      });
      this.salaryDetailsForm.get('employeeSalaryTaxAndStatutorySetting')?.disable();
      this.calculateStatutoryComponents();
    });
  }
}