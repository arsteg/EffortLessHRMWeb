import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { AssignedFixedAllowanceComponent } from './fixed-allowance/fixed-allowance.component';
import { AssignedFixedDeductionComponent } from './fixed-deduction/fixed-deduction.component';
import { VarAllowanceComponent } from './var-allowance/var-allowance.component';
import { VarDeductionComponent } from './var-deduction/var-deduction.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-assigned-templates',
  templateUrl: './assigned-templates.component.html',
  styleUrl: './assigned-templates.component.css'
})
export class AssignedTemplatesComponent {
  isEdit = this.payroll.isEdit.getValue();
  @Output() recordUpdated: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('fixedAllowanceChild') fixedAllowanceChildComponent: AssignedFixedAllowanceComponent;
  
  @ViewChild('fixedDeductionChild') fixedDeductionChildComponent: AssignedFixedDeductionComponent;
  
  @ViewChild('variableAllowanceChild') variableAllowanceChildComponent: VarAllowanceComponent;
  
  @ViewChild('variableDeductionChild') variableDeductionChildComponent: VarDeductionComponent;
  activeTabIndex: number = 0;  
  tabChanges: { [key: number]: boolean } = {};
  visitedTabs: Set<number> = new Set();
  fixedAllowanceData: any;
  fixedDeductionData: any;
  variableAllowanceData: any;
  variableDeductionData: any;
  employerContributionsData: any;
  employeeDeductionsData: any;
  form: any;
  selectedRecord: any;

  constructor(
    private payroll: PayrollService,
    private toast: ToastrService,
    private router: Router,  
    private translate: TranslateService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.payroll.selectedCTCTemplate.subscribe(res => {
      this.selectedRecord = res;
    });
    this.updateForm();
    this.selectedRecord = this.payroll.selectedCTCTemplate.getValue();
  }
  onTabChange(index: number) {
    this.activeTabIndex = index;
    this.visitedTabs.add(index); // Track tabs user interacted with
  }
  goBack() {
    this.router.navigate(['home/payroll/ctc-template']);
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

  }
  markTabAsChanged(tabIndex: number) {
    this.tabChanges[tabIndex] = true;
  }
  onFixedAllowanceDataChange(data: any) {
    this.fixedAllowanceData = data;
    if (this.activeTabIndex === 0) {     
      this.markTabAsChanged(0);
    }
  }

  onFixedDeductionDataChange(data: any) {
    this.fixedDeductionData = data;
    if (this.activeTabIndex === 1) {    
      this.markTabAsChanged(1);
    }
  }

  onVariableAllowanceDataChange(data: any) {
    if (this.activeTabIndex === 2) {
      this.variableAllowanceData = data;
      this.markTabAsChanged(2);
    }
  }

  onVariableDeductionDataChange(data: any) {
   if (this.activeTabIndex === 3) {
      this.variableDeductionData = data;
      this.markTabAsChanged(3);
    }
  }

  onSubmission() {
    const template = this.payroll.getFormValues.getValue();
    if (!this.fixedAllowanceChildComponent.isFormValid()) {
      this.toast.error(this.translate.instant('payroll._ctc_templates.toast.fixed_allowance_Invalid_data'));  
      return;
    }
    if (!this.fixedDeductionChildComponent.isFormValid()) {
      this.toast.error(this.translate.instant('payroll._ctc_templates.toast.fixed_deduction_Invalid_data'));  
      return;
    }
    if (!this.variableAllowanceChildComponent.isFormValid()) {
      this.toast.error(this.translate.instant('payroll._ctc_templates.toast.variable_allowance_Invalid_data'));  
      return;
    }
    if (!this.variableDeductionChildComponent.isFormValid()) {
      this.toast.error(this.translate.instant('payroll._ctc_templates.toast.variable_deduction_Invalid_data'));  
      return;
    }
    console.log(this.variableAllowanceData);
    let payload = {
      name: template.name,
      ctcTemplateFixedAllowance: this.tabChanges[0] ? this.fixedAllowanceData : this.selectedRecord.ctcTemplateFixedAllowances,
      ctcTemplateFixedDeduction: this.tabChanges[1] ? this.fixedDeductionData : this.selectedRecord.ctcTemplateFixedDeductions,
      ctcTemplateVariableAllowance: this.tabChanges[2] ? this.variableAllowanceData : this.selectedRecord.ctcTemplateVariableAllowances,
      ctcTemplateVariableDeduction: this.tabChanges[3] ? this.variableDeductionData : this.selectedRecord.ctcTemplateVariableDeductions

    };
    if (this.isEdit) {
      const id = this.payroll.selectedCTCTemplate.getValue()._id;
      this.payroll.updateCTCTemplate(id, payload).subscribe((res: any) => {
        this.recordUpdated.emit(res.data);
        this.toast.success(this.translate.instant('payroll._ctc_templates.toast.success_updated'));
      }, err => {
        this.toast.error(this.translate.instant('payroll._ctc_templates.toast.failed_updated'));  
      })
    } else {
      this.payroll.addCTCTemplate(payload).subscribe((res: any) => {
        this.recordUpdated.emit(res.data);
        this.toast.success(this.translate.instant('payroll._ctc_templates.toast.success_saved'));
      }, err => {
        this.toast.error(this.translate.instant('payroll._ctc_templates.toast.failed_saved'));  
      })
    }
  }
}