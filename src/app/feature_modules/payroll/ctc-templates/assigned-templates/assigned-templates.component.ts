import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-assigned-templates',
  templateUrl: './assigned-templates.component.html',
  styleUrl: './assigned-templates.component.css'
})
export class AssignedTemplatesComponent {
  isEdit = this.payroll.isEdit.getValue();
  @Output() recordUpdated: EventEmitter<any> = new EventEmitter<any>();
  activeTabIndex: number = 0;
  fixedAllowanceData: any;
  fixedDeductionData: any;
  variableAllowanceData: any;
  variableDeductionData: any;
  form: any;
  selectedRecord: any;

  constructor(
    private payroll: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.updateForm();
    this.selectedRecord = this.payroll.selectedCTCTemplate.getValue();
  }

  goToCTC() {
    this.router.navigate(['home/payroll/ctc-template'])
  }

  goBackToUpdateCTC() {
    const id = this.selectedRecord?._id || this.route.snapshot.paramMap.get('id');
    console.log(this.route);
    console.log(id)
    if (id) {
      this.router.navigate([`home/payroll/ctc-template/update-ctc-template/${id}`]);
    }
    else {
      this.router.navigate([`home/payroll/ctc-template/update-ctc-template`]);
    }
  }

  updateForm() {
    this.payroll.selectedCTCTemplate.subscribe(res => {
      this.form = res;
      this.fixedAllowanceData = res.ctcTemplateFixedAllowances || [];
      this.fixedDeductionData = res.ctcTemplateFixedDeduction || [];
      this.variableAllowanceData = res.ctcTemplateVariableAllowance || [];
      this.variableDeductionData = res.ctcTemplateVariableDeduction || [];
    });
  }

  onFixedAllowanceDataChange(data: any) {
    this.fixedAllowanceData = data;
  }

  onFixedDeductionDataChange(data: any) {
    this.fixedDeductionData = data;
  }

  onVariableAllowanceDataChange(data: any) {
    this.variableAllowanceData = data;
  }

  onVariableDeductionDataChange(data: any) {
    this.variableDeductionData = data;
  }

  onSubmission() {
    let payload = {
      name: this.selectedRecord.name,
      ctcTemplateFixedAllowance: this.fixedAllowanceData || [],
      ctcTemplateFixedDeduction: this.fixedDeductionData || [],
      ctcTemplateVariableAllowance: this.variableAllowanceData || [],
      ctcTemplateVariableDeduction: this.variableDeductionData || [],
      ctcTemplateEmployerContribution: this.selectedRecord.ctcTemplateEmployerContributions.filter(Boolean).map(fixedContribution => ({ fixedContribution: fixedContribution.fixedContribution._id, value: 'As per the Norms' })) || [],
      ctcTemplateOtherBenefitAllowance: this.selectedRecord.ctcTemplateOtherBenefitAllowances.filter(Boolean).map(otherBenefit => ({ otherBenefit: otherBenefit.otherBenefit._id, value: 'As per the Norms' })) || [],
      ctcTemplateEmployeeDeduction: this.selectedRecord.ctcTemplateEmployeeDeductions.filter(Boolean).map(employeeDeduction => ({ employeeDeduction: employeeDeduction.employeeDeduction._id, value: 'As per the Norms' })) || [],
    };
    console.log('edit:', this.isEdit)
    console.log(payload);
    if (this.isEdit) {
      this.payroll.updateCTCTemplate(this.selectedRecord._id, payload).subscribe((res: any) => {
        this.recordUpdated.emit(res.data);
        this.toast.success('CTC Template updated successfully');
      }, err => {
        this.toast.error('CTC Template update failed');
      })
    } else {
      this.payroll.addCTCTemplate(payload).subscribe((res: any) => {
        this.recordUpdated.emit(res.data);
        this.toast.success('CTC Template added successfully');
      }, err => {
        this.toast.error('CTC Template add failed');
      })
    }
  }
}