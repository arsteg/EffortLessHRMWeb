import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
  variableAllowanceData: any;
  variableDeductionData: any;
  form: any;
  @Output() recordUpdated: EventEmitter<any> = new EventEmitter<any>();

  constructor(private payroll: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.payroll.assignedTemplates.subscribe(res => {
      console.log(res);
      this.form = res;
      Object.entries(this.form).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          this.form[key] = [];
        }
      });
    });
    // this.payroll.assignedTemplates.subscribe(res => {
    //   console.log(res);
    //   const fixedAllowances = res.ctcTemplateFixedAllowance;
    //   const fixedAllowanceValues = fixedAllowances.map(obj => obj.fixedAllowance);
    //   this.data = fixedAllowanceValues;
    //   console.log(this.data);
    // });
  }

  selectTab(tabId: string) {
    if (tabId === 'tabFixedAllowance') {
      this.payroll.assignedTemplates.subscribe(res => {
        console.log(res);
        const fixedAllowances = res.ctcTemplateFixedAllowance;
        const fixedAllowanceValues = fixedAllowances.map(obj => obj.fixedAllowance);
        this.data = fixedAllowanceValues;
        console.log(this.data);
      });
    }
    this.activeTab = tabId;

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
      name: this.data.name,
      ctcTemplateFixedAllowance: this.fixedAllowanceData || [],
      ctcTemplateFixedDeduction: this.fixedDeductionData || [],
      ctcTemplateVariableAllowance: this.variableAllowanceData || [],
      ctcTemplateVariableDeduction: this.variableDeductionData || [],
      ctcTemplateEmployerContribution: this.data.ctcTemplateEmployerContribution.filter(Boolean).map(fixedContribution => ({ fixedContribution, value: 'As per the Norms' })) || [],
      ctcTemplateOtherBenefitAllowance: this.data.ctcTemplateOtherBenefitAllowance.filter(Boolean).map(otherBenefit => ({ otherBenefit, value: 'As per the Norms' })) || [],
      ctcTemplateEmployeeDeduction: this.data.ctcTemplateEmployeeDeduction.filter(Boolean).map(employeeDeduction => ({ employeeDeduction, value: 'As per the Norms' })) || [],
    };
    if (this.isEdit) {
      this.payroll.updateCTCTemplate(this.selectedRecord._id, payload).subscribe((res: any) => {
        this.recordUpdated.emit(res.data);
        this.toast.success('CTC Template updated successfully');
      },
        err => {
          this.toast.error('CTC Template update failed');
        })
    }
    else {
      this.payroll.addCTCTemplate(payload).subscribe((res: any) => {
        this.toast.success('CTC Template added successfully');
      },
        err => {
          this.toast.error('CTC Template add failed');
        })
    }
  }

}
