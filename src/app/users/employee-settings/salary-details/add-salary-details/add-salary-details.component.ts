import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-add-salary-details',
  templateUrl: './add-salary-details.component.html',
  styleUrl: './add-salary-details.component.css'
})
export class AddSalaryDetailsComponent {
  @Output() backToSalaryDetails = new EventEmitter<void>();
  disableSelect = new FormControl(false);
  salaryDetailsForm: FormGroup;
  @Input() selectedUser: any;
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

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private payrollService: PayrollService,
  ) {
    this.salaryDetailsForm = this.fb.group({
      user: '',
      payrollEffectiveFrom: '',
      actualEffectiveDate: '',
      frequencyToEnterCTC: '',
      CTCTemplate: '',
      isEmployerPartInclusiveInSalaryStructure: false,
      enteringAmount: '',
      Amount: 0,
      totalCTCExcludingVariableAndOtherBenefits: 0,
      totalCTCIncludingVariable: 0,
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
    this.employerContributionArray.push(allowanceGroup)
  }

  addFixedDeduction(): void {
    const allowanceGroup = this.fb.group({
      fixedDeduction: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    this.fixedDeductionArray.push(allowanceGroup)
  }

  addVariableAllowance(): void {
    const allowanceGroup = this.fb.group({
      variableAllowance: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    this.variableAllowanceArray.push(allowanceGroup)
  }

  addVariableDeduction(): void {
    const allowanceGroup = this.fb.group({
      variableDeduction: ['', Validators.required],
      monthlyAmount: [0, Validators.required],
      yearlyAmount: [0, Validators.required],
    });
    this.variableDeductionArray.push(allowanceGroup)
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

  onSubmissionSalaryDetails(): void {
    const payload = this.salaryDetailsForm.value;
    const formValues = this.employeeSalaryTaxAndStatutorySetting.value;
    const requests = [formValues];
    payload.employeeSalaryTaxAndStatutorySetting = requests;
    payload.user = this.selectedUser.id;
    this.userService.addSalaryDetails(payload).subscribe((res: any) => {
    })
  }

  getCTCTemplates() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payrollService.getCTCTemplate(payload).subscribe((res: any) => {
      this.ctcTemplates = res.data;
    })
  }

  getCTCTemplateById(id: string): void {
    this.payrollService.getCTCTemplateById(id).subscribe(
      (ctcTemplate: any) => {
        // this.ctcTemplates = ctcTemplate.data;
      },
      (error: any) => {
        console.error('Error fetching CTC template:', error);
      }
    );
  }

  getPayrolls() {
    let payload = {
      next: '',
      skip: ''
    }
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
        benefitGroup.patchValue(benefit)
      });
      const salaryComponentVariableDeduction = res.data.variableDeductionList;
      this.variableDeductionArray.clear();
      salaryComponentVariableDeduction.forEach((benefit) => {
        this.addVariableDeduction();
        const benefitGroup = this.variableDeductionArray.at(this.variableDeductionArray.length - 1);
        benefitGroup.patchValue(benefit)
      });
      const salaryComponentPFCharge = res.data.salaryComponentPFCharge;
      this.pfChargeArray.clear();
      salaryComponentPFCharge.forEach((benefit) => {
        this.addPFCharge();
        const benefitGroup = this.pfChargeArray.at(this.pfChargeArray.length - 1);
        benefitGroup.patchValue(benefit)
      });

    })
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
    console.log(matchingRecord, matchingRecord?.label);
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

}
