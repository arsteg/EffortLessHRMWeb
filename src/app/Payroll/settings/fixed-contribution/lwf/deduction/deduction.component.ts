
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ToastrService } from 'ngx-toastr';
// import { PayrollService } from 'src/app/_services/payroll.service';

// @Component({
//   selector: 'app-deduction',
//   templateUrl: './deduction.component.html',
//   styleUrls: ['./deduction.component.css']
// })
// export class DeductionComponent implements OnInit {
//   months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//   deductionMonth: any[] = [];
//   deductionForm: FormGroup;

//   constructor(
//     private payroll: PayrollService,
//     private fb: FormBuilder,
//     private toast: ToastrService
//   ) {
//     this.deductionForm = this.fb.group({
//       paymentMonth: ['', Validators.required],
//       processMonth: ['', Validators.required]
//     });
//   }

//   ngOnInit() {
//     this.getDeductionMonth();
//   }

//   getDeductionMonth() {
//     this.payroll.getDeductionMonth().subscribe(
//       data => {
//         this.deductionMonth = data.data;
//         this.updateFormValues();
//       },
//       error => {
//         console.log(error);
//       }
//     );
//   }

//   updateFormValues() {
//     const paymentMonth = this.deductionMonth.find(dm => dm.paymentMonth)?.paymentMonth;
//     const processMonth = this.deductionMonth.find(dm => dm.processMonth)?.processMonth;

//     if (paymentMonth) {
//       this.deductionForm.patchValue({
//         paymentMonth,
//         processMonth: processMonth ? true : false
//       });
//     }

//     console.log(this.deductionForm.value);
//   }

//   onSelectionChange(month: string, value: boolean) {
//     this.deductionForm.controls['processMonth'].setValue(value);
//     console.log(this.deductionForm.value);
//   }

//   isSelected(month: string, value: boolean): boolean {
//     return this.deductionForm.controls['processMonth'].value === value;
//   }

//   onSubmit() {
//     console.log(this.deductionForm.value);
//     this.payroll.updateDeductionMonth(this.deductionForm.value).subscribe(
//       data => {
//         this.toast.success('Deduction month updated successfully');
//       },
//       error => {
//         this.toast.error('Error updating deduction month');
//       }
//     );
//   }
// }
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
      error => {
        console.log(error);
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

    console.log(this.deductionForm.value);
  }

  onSelectionChange(month: string, value: boolean) {
    const monthForm = (this.deductionForm.get('months') as FormArray).controls.find((control) => control.value.paymentMonth === month);
    if (monthForm) {
      monthForm.patchValue({ processMonth: value });
    }
    console.log(this.deductionForm.value);
  }

  onSubmit() {
    console.log(this.deductionForm.value);
    this.payroll.updateLWFDeductionMonth(this.deductionForm.value).subscribe(
      data => {
        this.toast.success('Deduction month updated successfully');
      },
      error => {
        this.toast.error('Error updating deduction month');
      }
    );
  }
}
