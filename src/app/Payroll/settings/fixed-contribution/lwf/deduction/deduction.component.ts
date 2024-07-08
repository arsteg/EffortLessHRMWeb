// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { PayrollService } from 'src/app/_services/payroll.service';

// @Component({
//   selector: 'app-deduction',
//   templateUrl: './deduction.component.html',
//   styleUrl: './deduction.component.css'
// })
// export class DeductionComponent {
//   months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//   deductionMonth: any;
//   deductionForm: FormGroup;

//   constructor(private payroll: PayrollService,
//     private fb: FormBuilder
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
//         processMonth
//       });
//     }

//     console.log(this.deductionForm.value);
//   }

//   onSelectionChange(month: string, value: boolean) {
//     if (value) {
//       this.deductionForm.controls['processMonth'].setValue(month);
//     } else {
//       this.deductionForm.controls['processMonth'].setValue('');
//     }
//     console.log(this.deductionForm.value);
//   }

//   isSelected(month: string): boolean {
//     return this.deductionForm.controls['processMonth'].value === month;
//   }

//   onSubmit() {
//     console.log(this.deductionForm.value);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-deduction',
  templateUrl: './deduction.component.html',
  styleUrls: ['./deduction.component.css']
})
export class DeductionComponent implements OnInit {
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  deductionMonth: any[] = [];
  deductionForm: FormGroup;

  constructor(
    private payroll: PayrollService,
    private fb: FormBuilder
  ) {
    this.deductionForm = this.fb.group({
      paymentMonth: ['', Validators.required],
      processMonth: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getDeductionMonth();
  }

  getDeductionMonth() {
    this.payroll.getDeductionMonth().subscribe(
      data => {
        this.deductionMonth = data.data;
        this.updateFormValues();
      },
      error => {
        console.log(error);
      }
    );
  }

  updateFormValues() {
    const paymentMonth = this.deductionMonth.find(dm => dm.paymentMonth)?.paymentMonth;
    const processMonth = this.deductionMonth.find(dm => dm.processMonth)?.processMonth;

    if (paymentMonth) {
      this.deductionForm.patchValue({
        paymentMonth,
        processMonth: processMonth ? true : false
      });
    }

    console.log(this.deductionForm.value);
  }

  onSelectionChange(month: string, value: boolean) {
    this.deductionForm.controls['processMonth'].setValue(value);
    console.log(this.deductionForm.value);
  }

  isSelected(month: string, value: boolean): boolean {
    return this.deductionForm.controls['processMonth'].value === value;
  }

  onSubmit() {
    console.log(this.deductionForm.value);
  }
}
