import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-deduction',
  templateUrl: './deduction.component.html',
  styleUrls: ['./deduction.component.css']
})
export class DeductionComponent implements OnInit {
  // Use lowercase month names to match translation keys
  months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  deductionForm: FormGroup;

  constructor(
    private payroll: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.deductionForm = this.fb.group({
      months: this.fb.array([])
    });
    this.initializeMonths();
  }

  ngOnInit() {
    this.getDeductionMonth();
  }

  initializeMonths() {
    const monthsArray = this.deductionForm.get('months') as FormArray;
    this.months.forEach(month => {
      monthsArray.push(this.fb.group({
        paymentMonth: month,
        processMonth: [false]
      }));
    });
  }

  get monthsArray() {
    return (this.deductionForm.get('months') as FormArray).controls;
  }

  getDeductionMonth() {
    this.payroll.getLWFDeductionMonth().subscribe(
      data => {
        this.updateFormValues(data.data);
      },
      err => {
        const errorMessage = err?.error?.message || this.translate.instant('payroll._lwf.monthly_deduction.toast.error_fetch');
        this.translate.get('payroll._lwf.monthly_deduction.title').subscribe(title => {
          this.toast.error(errorMessage, title);
        });
      }
    );
  }

  updateFormValues(deductionData: any) {
    const monthsArray = this.deductionForm.get('months') as FormArray;
    deductionData.forEach((deduction: any) => {
      const monthForm = monthsArray.controls.find((monthForm) => 
        monthForm.value.paymentMonth === deduction.paymentMonth.toLowerCase()
      );
      if (monthForm) {
        monthForm.patchValue({ processMonth: deduction.processMonth });
      }
    });
  }

  onSelectionChange(month: string, value: boolean) {
    const monthForm = (this.deductionForm.get('months') as FormArray).controls.find(
      (control) => control.value.paymentMonth === month.toLowerCase()
    );
    if (monthForm) {
      monthForm.patchValue({ processMonth: value });
    }
  }

  onSubmit() {
    this.payroll.updateLWFDeductionMonth(this.deductionForm.value).subscribe(
      data => {
        this.translate.get([
          'payroll._lwf.monthly_deduction.toast.success_updated',
        ]).subscribe(translations => {
          this.toast.success(
            translations['payroll._lwf.monthly_deduction.toast.success_updated'],
          );
        });
      },
      err => {
        const errorMessage = err?.error?.message || this.translate.instant('payroll._lwf.monthly_deduction.toast.error_update');
        this.translate.get('payroll._lwf.monthly_deduction.title').subscribe(title => {
          this.toast.error(errorMessage, title);
        });
      }
    );
  }
}