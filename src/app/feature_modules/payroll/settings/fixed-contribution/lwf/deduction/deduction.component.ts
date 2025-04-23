import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-deduction',
  templateUrl: './deduction.component.html',
  styleUrls: ['./deduction.component.css']
})
export class DeductionComponent implements OnInit {
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  deductionForm: FormGroup;

  constructor(
    private payroll: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService
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
        processMonth: false
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
        const errorMessage = err?.error?.message || err?.message || err 
        || 'LWF Slab can not be updated.';
        this.toast.error(errorMessage, 'Error!');
      }
    );
  }

  updateFormValues(deductionData: any) {
    const monthsArray = this.deductionForm.get('months') as FormArray;
    deductionData.forEach((deduction: any) => {
      const monthForm = monthsArray.controls.find((monthForm) => monthForm.value.paymentMonth === deduction.paymentMonth);
      if (monthForm) {
        monthForm.patchValue({ processMonth: deduction.processMonth });
      }
    });
  }

  onSelectionChange(month: string, value: boolean) {
    const monthForm = (this.deductionForm.get('months') as FormArray).controls.find((control) => control.value.paymentMonth === month);
    if (monthForm) {
      monthForm.patchValue({ processMonth: value });
    }
  }

  onSubmit() {
    console.log(this.deductionForm.value);
    this.payroll.updateLWFDeductionMonth(this.deductionForm.value).subscribe(
      data => {
        this.toast.success('Deduction month updated successfully');
      },
      err => {
        const errorMessage = err?.error?.message || err?.message || err 
        || 'LWF Slab can not be updated.';
        this.toast.error(errorMessage, 'Error!');
      }
    );
  }
}
