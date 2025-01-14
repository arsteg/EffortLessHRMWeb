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
  taxStatutoryForm: FormGroup;
  pfTemplates: any;
  fixedAllowance: any;
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

  constructor(private fb: FormBuilder,
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
      enteringAmount: ['Monthly'],
      Amount: [0],
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
        gratuityTemplate: [''],
        isIncomeTaxDeduction: [false],
        isPFChargesApplicable: [false],
        isRoundOffApplicable: [false]
      }),
      salaryComponentFixedAllowance: this.fb.array([]),
      salaryComponentOtherBenefits: this.fb.array([]),
      salaryComponentEmployerContribution: this.fb.array([]),
      salaryComponentFixedDeduction: this.fb.array([]),
      salaryComponentVariableAllowance: this.fb.array([]),
      salaryComponentVariableDeduction: this.fb.array([]),
      salaryComponentPFCharge: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.logUrlSegmentsForUser();
    this.salaryDetailsForm.patchValue({ CTCTemplate: 'manual' });
    this.addFixedAllowance();
    this.addOtherBenefit();
    this.addEmployerContribution();
    this.addFixedDeduction();
    this.addVariableAllowance();
    this.addVariableDeduction();
    this.addPFCharge();
    this.getPayrolls();
    this.getCTCTemplates();
    if (this.edit) {
      this.getSalaryDetailsById();
      this.disableFormControls(this.salaryDetailsForm);
    }

    // Subscribe to changes in the Amount control
    this.salaryDetailsForm.get('Amount').valueChanges.subscribe((amount) => {
      const ctcTemplateId = this.salaryDetailsForm.get('CTCTemplate').value;
      if (ctcTemplateId && ctcTemplateId !== 'manual') {
        this.getCTCTemplateById(ctcTemplateId);
      }
    });
  }

  disableFormControls(formGroup: FormGroup | FormArray) {
    if (formGroup instanceof FormGroup) {
      formGroup.disable();
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control instanceof FormGroup) {
          this.disableFormControls(control);
        } else if (control instanceof FormArray) {
          control.controls.forEach(formArrayControl => {
            if (formArrayControl instanceof FormGroup) {
              formArrayControl.disable();
              this.disableFormControls(formArrayControl);
            } else {
              formArrayControl.disable();
            }
          });
          control.disable(); // disable the form array itself
        } else {
          control.disable();
        }
      });
    } else if (formGroup instanceof FormArray) {
      formGroup.controls.forEach(formArrayControl => {
        if (formArrayControl instanceof FormGroup) {
          formArrayControl.disable();
          this.disableFormControls(formArrayControl);
        } else {
          formArrayControl.disable();
        }
      });
      formGroup.disable(); // disable the form array itself
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

  handleMonthlyAmountChanges() {
    const otherBenefitsArray = this.salaryDetailsForm.get('salaryComponentOtherBenefits') as FormArray;
    const employerContributionArray = this.salaryDetailsForm.get('salaryComponentEmployerContribution') as FormArray;

    otherBenefitsArray.controls.forEach((group: FormGroup) => {
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
    employerContributionArray.controls.forEach((group: FormGroup) => {
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
  }

  addFixedAllowance(): void {
    const allowanceGroup = this.fb.group({
      fixedAllowance: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    this.fixedAllowances.push(allowanceGroup);
  }

  addOtherBenefit(): void {
    const allowanceGroup = this.fb.group({
      otherBenefits: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    this.otherBenefitsArray.push(allowanceGroup);
  }

  addEmployerContribution(): void {
    const allowanceGroup = this.fb.group({
      employerContribution: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    this.employerContributionArray.push(allowanceGroup);
  }

  addFixedDeduction(): void {
    const allowanceGroup = this.fb.group({
      fixedDeduction: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    this.fixedDeductionArray.push(allowanceGroup);
  }

  addVariableAllowance(): void {
    const allowanceGroup = this.fb.group({
      variableAllowance: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    this.variableAllowanceArray.push(allowanceGroup);
  }

  addVariableDeduction(): void {
    const allowanceGroup = this.fb.group({
      variableDeduction: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    this.variableDeductionArray.push(allowanceGroup);
  }

  addPFCharge(): void {
    const allowanceGroup = this.fb.group({
      pfCharge: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    if (!allowanceGroup.touched && allowanceGroup.pristine) {
      this.salaryDetailsForm.value.salaryComponentPFCharge = [];
    } else {
      this.pfChargeArray.push(allowanceGroup);
    }
  }

  logUrlSegmentsForUser() {
    const urlPath = this.router.url;
    const segments = urlPath.split('/').filter(segment => segment);
    if (segments.length >= 3) {
      const employee = segments[segments.length - 3];
      this.userService.getUserByEmpCode(employee).subscribe((res: any) => {
        this.selectedUser = res.data;
      })
    }
  }

  onSubmissionSalaryDetails(): void {
    const payload = this.salaryDetailsForm.value;
    const formValues = this.employeeSalaryTaxAndStatutorySetting.value;
    const requests = [formValues];
    payload.employeeSalaryTaxAndStatutorySetting = requests;
    payload.user = this.selectedUser[0].id;

    payload.salaryComponentEmployerContribution = payload.salaryComponentEmployerContribution.filter(item => item?.employerContribution !== '');
    payload.salaryComponentFixedAllowance = payload.salaryComponentFixedAllowance.filter(item => item?.fixedAllowance !== '');
    payload.salaryComponentFixedDeduction = payload.salaryComponentFixedDeduction.filter(item => item?.fixedDeduction !== '');
    payload.salaryComponentOtherBenefits = payload.salaryComponentOtherBenefits.filter(item => item?.otherBenefits !== '');
    payload.salaryComponentVariableAllowance = payload.salaryComponentVariableAllowance.filter(item => item?.variableAllowance !== '');
    payload.salaryComponentVariableDeduction = payload.salaryComponentVariableDeduction.filter(item => item?.variableDeduction !== '');
    payload.salaryComponentPFCharge = payload.salaryComponentPFCharge.filter(item => item?.pfCharge !== '');

    this.userService.addSalaryDetails(payload).subscribe((res: any) => {
      this.toast.success('The salary details have been successfully added.')
    },
      err => {
        this.toast.error('The salary details can not be added', 'Error')
      })
  }

  getCTCTemplates() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payrollService.getCTCTemplate(payload).subscribe((res: any) => {
      this.ctcTemplates = res.data;
    });
  }

  getCTCTemplateById(id: string): void {
    this.payrollService.getCTCTemplateById(id).subscribe(
      (ctcTemplate: any) => {
        // CTC template fixed allowances
        const fixedAllowanceArray = this.salaryDetailsForm.get('salaryComponentFixedAllowance') as FormArray;
        fixedAllowanceArray.clear();
        ctcTemplate.data.ctcTemplateFixedAllowances.forEach((fixedAllowance: any) => {
          if (fixedAllowance.criteria == 'Amount') {
            const allowanceGroup = this.fb.group({
              fixedAllowance: [fixedAllowance.fixedAllowance],
              monthlyAmount: [fixedAllowance.value],
              yearlyAmount: [fixedAllowance.value * 12]
            });
            fixedAllowanceArray.push(allowanceGroup);
          }
          if (fixedAllowance.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (fixedAllowance.value / 100) * grossPay;
            const allowanceGroup = this.fb.group({
              fixedAllowance: [fixedAllowance.fixedAllowance],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            });
            fixedAllowanceArray.push(allowanceGroup);
          }
        });

        // CTC template other benefits
        const otherBenefitsArray = this.salaryDetailsForm.get('salaryComponentOtherBenefits') as FormArray;
        otherBenefitsArray.clear();

        ctcTemplate.data.ctcTemplateOtherBenefitAllowances.forEach((otherBenefit: any) => {
          if (otherBenefit.criteria == 'Amount') {
            const benefitGroup = this.fb.group({
              otherBenefits: [otherBenefit.otherBenefit],  // Bind other benefit
              monthlyAmount: [otherBenefit.value],
              yearlyAmount: [otherBenefit.value * 12]
            });
            otherBenefitsArray.push(benefitGroup);
          }
          if (otherBenefit.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (otherBenefit.value / 100) * grossPay;
            const benefitGroup = this.fb.group({
              otherBenefits: [otherBenefit.otherBenefit],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            });
            otherBenefitsArray.push(benefitGroup);
          }
          this.handleMonthlyAmountChanges();
        });

        // CTC template employer contributions
        const employerContributionArray = this.salaryDetailsForm.get('salaryComponentEmployerContribution') as FormArray;
        employerContributionArray.clear();
        ctcTemplate.data.ctcTemplateEmployerContributions.forEach((fixedContribution: any) => {
          if (fixedContribution.criteria == 'Amount') {
            const employerContributionGroup = this.fb.group({
              employerContribution: [fixedContribution.fixedContribution],
              monthlyAmount: [fixedContribution.value],
              yearlyAmount: [fixedContribution.value * 12]
            });
            employerContributionArray.push(employerContributionGroup);
          }
          if (fixedContribution.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (fixedContribution.value / 100) * grossPay;
            const employerContributionGroup = this.fb.group({
              employerContribution: [fixedContribution.fixedContribution],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            });
            employerContributionArray.push(employerContributionGroup);
          }

          this.handleMonthlyAmountChanges();
        });

        // CTC template fixed deductions
        const fixedDeductionArray = this.salaryDetailsForm.get('salaryComponentFixedDeduction') as FormArray;
        fixedDeductionArray.clear();
        ctcTemplate.data.ctcTemplateFixedDeductions.forEach((fixedDeduction: any) => {
          if (fixedDeduction.criteria == 'Amount') {
            const deductionGroup = this.fb.group({
              fixedDeduction: [fixedDeduction.fixedDeduction],
              monthlyAmount: [fixedDeduction.value],
              yearlyAmount: [fixedDeduction.value * 12]
            });
            fixedDeductionArray.push(deductionGroup);
          }
          if (fixedDeduction.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (fixedDeduction.value / 100) * grossPay;
            const deductionGroup = this.fb.group({
              fixedDeduction: [fixedDeduction.fixedDeduction],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            });
            fixedDeductionArray.push(deductionGroup);
          }
        });

        // CTC template variable allowances
        const variableAllowanceArray = this.salaryDetailsForm.get('salaryComponentVariableAllowance') as FormArray;
        variableAllowanceArray.clear();
        ctcTemplate.data.ctcTemplateVariableAllowances.forEach((variableAllowance: any) => {
          if (variableAllowance.criteria == 'Amount') {
            const allowanceGroup = this.fb.group({
              variableAllowance: [variableAllowance.variableAllowance],  // Bind variable allowance
              monthlyAmount: [variableAllowance.value],
              yearlyAmount: [variableAllowance.value * 12]
            });
            variableAllowanceArray.push(allowanceGroup);
          }
          if (variableAllowance.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (variableAllowance.value / 100) * grossPay;
            const allowanceGroup = this.fb.group({
              variableAllowance: [variableAllowance.variableAllowance],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            });
            variableAllowanceArray.push(allowanceGroup);
          }
        });

        // CTC template variable deductions
        const variableDeductionArray = this.salaryDetailsForm.get('salaryComponentVariableDeduction') as FormArray;
        variableDeductionArray.clear();
        ctcTemplate.data.ctcTemplateVariableDeductions.forEach((variableDeduction: any) => {
         if(variableDeduction.criteria == 'Amount') {
            const deductionGroup = this.fb.group({
              variableDeduction: [variableDeduction.variableDeduction],
              monthlyAmount: [variableDeduction.value],
              yearlyAmount: [variableDeduction.value * 12]
            });
            variableDeductionArray.push(deductionGroup);
          }
          if (variableDeduction.criteria == 'Percentage') {
            const grossPay = this.salaryDetailsForm.get('Amount').value;
            const monthlyAmount = (variableDeduction.value / 100) * grossPay;
            const deductionGroup = this.fb.group({
              variableDeduction: [variableDeduction.variableDeduction],
              monthlyAmount: [monthlyAmount],
              yearlyAmount: [monthlyAmount * 12]
            });
            variableDeductionArray.push(deductionGroup);
          }
        });
      },
      (error: any) => {
        this.toast.error('Error fetching CTC template:', 'Error');
      }
    );
  }

  getPayrolls() {
    let payload = {
      next: '',
      skip: ''
    };
    this.payrollService.getPfTemplate(payload).subscribe((res: any) => {
      this.pfTemplates = res.data;
    });
    this.payrollService.getFixedAllowance(payload).subscribe((res: any) => {
      this.fixedAllowance = res.data;
    });
    this.payrollService.getOtherBenefits(payload).subscribe((res: any) => {
      this.otherBenefits = res.data;
    });
    this.payrollService.getFixedContribution(payload).subscribe((res: any) => {
      this.employerContribution = res.data;
    });
    this.payrollService.getFixedDeduction(payload).subscribe((res: any) => {
      this.fixedDeduction = res.data;
    });
    this.payrollService.getVariableAllowance(payload).subscribe((res: any) => {
      this.variableAllowance = res.data;
    });
    this.payrollService.getVariableDeduction(payload).subscribe((res: any) => {
      this.variableDeduction = res.data;
    });
    this.payrollService.getAllPFCharges(payload).subscribe((res: any) => {
      this.pfCharge = res.data;
    });
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
        const allowanceGroup = this.fixedAllowances.at(this.fixedAllowances.length - 1);
        allowanceGroup.patchValue(allowance);
      });

      const salaryComponentOtherBenefits = res.data.otherBenefitList;
      this.otherBenefitsArray.clear();
      salaryComponentOtherBenefits.forEach((benefit) => {
        this.addOtherBenefit();
        const benefitGroup = this.otherBenefitsArray.at(this.otherBenefitsArray.length - 1);
        benefitGroup.patchValue(benefit);
      });

      const salaryComponentEmployerContribution = res.data.employerContributionList;
      this.employerContributionArray.clear();
      salaryComponentEmployerContribution.forEach((benefit) => {
        this.addEmployerContribution();
        const benefitGroup = this.employerContributionArray.at(this.employerContributionArray.length - 1);
        benefitGroup.patchValue(benefit);
      });

      const salaryComponentFixedDeduction = res.data.fixedDeductionList;
      this.fixedDeductionArray.clear();
      salaryComponentFixedDeduction.forEach((benefit) => {
        this.addFixedDeduction();
        const benefitGroup = this.fixedDeductionArray.at(this.fixedDeductionArray.length - 1);
        benefitGroup.patchValue(benefit);
      });

      const salaryComponentVariableAllowance = res.data.variableAllowanceList;
      this.variableAllowanceArray.clear();
      salaryComponentVariableAllowance.forEach((benefit) => {
        this.addVariableAllowance();
        const benefitGroup = this.variableAllowanceArray.at(this.variableAllowanceArray.length - 1);
        benefitGroup.patchValue(benefit);
      });

      const salaryComponentVariableDeduction = res.data.variableDeductionList;
      this.variableDeductionArray.clear();
      salaryComponentVariableDeduction.forEach((benefit) => {
        this.addVariableDeduction();
        const benefitGroup = this.variableDeductionArray.at(this.variableDeductionArray.length - 1);
        benefitGroup.patchValue(benefit);
      });

      const salaryComponentPFCharge = res.data.salaryComponentPFCharge;
      this.pfChargeArray.clear();
      salaryComponentPFCharge.forEach((benefit) => {
        this.addPFCharge();
        const benefitGroup = this.pfChargeArray.at(this.pfChargeArray.length - 1);
        benefitGroup.patchValue(benefit);
      });
    });
  }

  getFixedAllowance(data: string) {
    const matchingRecord = this.fixedAllowance?.find(rec => rec._id === data);
    return matchingRecord?.label;
  }

  getOtherBenefits(data: string) {
    const matchingRecord = this.otherBenefits?.find(rec => rec._id === data);
    return matchingRecord?.label;
  }

  getEmployerContribution(data: string) {
    const matchingRecord = this.employerContribution?.find(rec => rec._id === data);
    return matchingRecord?.label;
  }

  getFixedDeduction(data: string) {
    const matchingRecord = this.fixedDeduction?.find(rec => rec._id === data);
    return matchingRecord?.label;
  }

  getVariableAllowance(data: string) {
    const matchingRecord = this.variableAllowance?.find(rec => rec._id === data);
    return matchingRecord?.label;
  }

  getVariableDeduction(data: string) {
    const matchingRecord = this.variableDeduction?.find(rec => rec._id === data);
    return matchingRecord?.label;
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
    this.salaryDetailsForm.get('salaryComponentFixedDeduction').enable();
    this.salaryDetailsForm.get('salaryComponentVariableAllowance').enable();
    this.salaryDetailsForm.get('salaryComponentVariableDeduction').enable();
    this.salaryDetailsForm.get('salaryComponentPFCharge').enable();
  }
}
