import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-assigned-templates',
  templateUrl: './assigned-templates.component.html',
  styleUrl: './assigned-templates.component.css'
})
export class AssignedTemplatesComponent {
  @Input() data: any;
  activeTab: string = 'tabFixedAllowance';
  @Input() selectedRecord: any;
  ctcTemplateForm: FormGroup;
  @Input() isEdit: boolean = false;
  fixedAllowanceData: any;
  fixedDeductionData: any;

  constructor(private payroll: PayrollService,
    private fb: FormBuilder
  ) {
    // this.ctcTemplateForm = this.fb.group({
    //   name: [''],
    //   ctcTemplateFixedAllowance: [[]],
    //   ctcTemplateFixedDeduction: [[]],
    //   ctcTemplateEmployerContribution: [[]],
    //   ctcTemplateOtherBenefitAllowance: [[]],
    //   ctcTemplateEmployeeDeduction: [[]]
    // })
  }

  ngOnInit() {
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

  onFixedAllowanceDataChange(data: any) {
    this.fixedAllowanceData = data;
  }
  onFixedDeductionDataChange(data: any) {
    this.fixedDeductionData = data;
  }

  onSubmission() {
    let payload = {
      name: this.data.name,
      ctcTemplateFixedAllowance: this.fixedAllowanceData,
      ctcTemplateFixedDeduction: this.fixedDeductionData,
      ctcTemplateEmployerContribution: this.data.ctcTemplateEmployerContribution.map(fixedContribution => ({ fixedContribution, value: 'As per the Norms' })),
      ctcTemplateOtherBenefitAllowance: this.data.ctcTemplateOtherBenefitAllowance.map(otherBenefit => ({ otherBenefit, value: 'As per the Norms' })),
      ctcTemplateEmployeeDeduction: this.data.ctcTemplateEmployeeDeduction.map(fixedDeduction => ({ fixedDeduction, value: 'As per the Norms' }))
    };
    if (this.isEdit) {
      this.payroll.updateCTCTemplate(this.selectedRecord._id, payload).subscribe((res: any) => {
      })
    }
    else{
    }
  }

}
