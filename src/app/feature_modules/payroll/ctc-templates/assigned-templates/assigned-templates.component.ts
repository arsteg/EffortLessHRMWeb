import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  otherBenefitsData: any;
  employerContributionsData: any;
  employeeDeductionsData: any;
  form: any;
  selectedRecord: any;

  constructor(
    private payroll: PayrollService,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.payroll.selectedCTCTemplate.subscribe(res => {
      this.selectedRecord = res;
    });
    this.updateForm();
    this.selectedRecord = this.payroll.selectedCTCTemplate.getValue();
  }

  goToCTC() {
    this.router.navigate(['home/payroll/ctc-template'])
  }

  goBackToUpdateCTC() {
    const id = this.selectedRecord?._id || this.route.snapshot.paramMap.get('id');
    this.payroll.showAssignedTemplate.next(true);
    if (id) {
      this.router.navigate([`home/payroll/ctc-template/update-ctc-template/${id}`]);
    } else {
      this.router.navigate([`home/payroll/ctc-template/create-ctc-template`],);
    }
  }

  updateForm() {
    if (this.isEdit) {
      this.payroll.selectedCTCTemplate.subscribe(res => {
        this.form = res;
        this.fixedAllowanceData = res.ctcTemplateFixedAllowances || [];
        this.fixedDeductionData = res.ctcTemplateFixedDeduction || [];
        this.variableAllowanceData = res.ctcTemplateVariableAllowance || [];
        this.variableDeductionData = res.ctcTemplateVariableDeduction || [];
      });
    }
    if (!this.isEdit) {
      this.payroll.fixedAllowances.subscribe(res => {
        this.fixedAllowanceData = res;
      });
      this.payroll.fixedDeductions.subscribe(res => {
        this.fixedDeductionData = res;
      });
      this.payroll.variableAllowances.subscribe(res => {
        this.variableAllowanceData = res;
      });
      this.payroll.variableDeductions.subscribe(res => {
        this.variableDeductionData = res;
      });
      this.payroll.otherBenefits.subscribe(res => {
        this.otherBenefitsData = res;
      });
      this.payroll.employeeDeduction.subscribe(res => {
        this.employeeDeductionsData = res;
      });
      this.payroll.fixedContributions.subscribe(res => {
        this.employerContributionsData = res;
      });
    }
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
    const template = this.payroll.getFormValues.getValue();
    let payload = {
      name: template.name,
      ctcTemplateFixedAllowance: this.fixedAllowanceData || [],
      ctcTemplateFixedDeduction: this.fixedDeductionData || [],
      ctcTemplateVariableAllowance: this.variableAllowanceData || [],
      ctcTemplateVariableDeduction: this.variableDeductionData || [],
      ctcTemplateEmployerContribution:  this.employerContributionsData || this.selectedRecord?.ctcTemplateEmployerContributions.filter(Boolean).map(fixedContribution => ({ fixedContribution: fixedContribution.fixedContribution._id, value: 'As per the Norms' })) || [],
      ctcTemplateOtherBenefitAllowance: this.otherBenefitsData || this.selectedRecord?.ctcTemplateOtherBenefitAllowances.filter(Boolean).map(otherBenefit => ({ otherBenefit: otherBenefit.otherBenefit._id, value: 'As per the Norms' })) || template?.ctcTemplateOtherBenefitAllowances || [],
      ctcTemplateEmployeeDeduction: this.employeeDeductionsData || this.selectedRecord?.ctcTemplateEmployeeDeductions.filter(Boolean).map(employeeDeduction => ({ employeeDeduction: employeeDeduction.employeeDeduction._id, value: 'As per the Norms' })) || template?.ctcTemplateEmployeeDeductions || [],
    };
    if (this.isEdit) {
      const id = this.payroll.selectedCTCTemplate.getValue()._id;
      this.payroll.updateCTCTemplate(id, payload).subscribe((res: any) => {
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