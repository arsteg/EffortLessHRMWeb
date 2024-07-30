import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private payrollService: PayrollService
  ) {
    this.salaryDetailsForm = this.fb.group({
      user: [''],
      payrollEffectiveFrom: [],
      actualEffectiveDate: [],
      frequencyToEnterCTC: [''],
      CTCTemplate: [''],
      isEmployerPartInclusiveInSalaryStructure: [true],
      enteringAmount: [''],
      Amount: [0],
      totalCTCExcludingVariableAndOtherBenefits: [0],
      totalCTCIncludingVariable: [0]
    })
  }

  ngOnInit() {
    console.log(this.selectedUser);
    console.log('add salary details page');
    this.getCTCTemplates();
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

  onSubmissionSalaryDetails() {
    this.salaryDetailsForm.value.user = this.selectedUser.id;
    this.userService.addSalaryDetails(this.salaryDetailsForm.value).subscribe((res: any) => {
      console.log(res.data);
    })
  }
}
