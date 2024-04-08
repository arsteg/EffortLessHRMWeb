import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-add-advance-report',
  templateUrl: './add-advance-report.component.html',
  styleUrl: './add-advance-report.component.css'
})
export class AddAdvanceReportComponent {
  addAdvanceReport: FormGroup;
  allCategory: any;
  allAssignee: any;
  categoriesByUser: any[];
  @Output() close: any = new EventEmitter();
  @Output() advanceReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  allAdvanceCategories: any;

  constructor(private fb: FormBuilder,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private toast: ToastrService) {
    this.addAdvanceReport = this.fb.group({
      employee: ['', Validators.required],
      category: ['', Validators.required],
      status: ['Level 1 Approval Pending', Validators.required],
      comment: [''],
      amount: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.expenseService.getAdvanceCatgories().subscribe((res: any) => {
      this.allCategory = res.data;
    });
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.expenseService.getAdvanceCatgories().subscribe((res: any) => {
      this.allAdvanceCategories = res.data;
      console.log(res.data);
    })
  }

  onSubmission() {
   
    console.log(this.addAdvanceReport.value)
    if(this.addAdvanceReport.valid){
      this.expenseService.addAdvanceReport(this.addAdvanceReport.value).subscribe((res: any) => {
        this.advanceReportRefreshed.emit();
        this.expenseService.advanceReport.next(res.data);
        this.addAdvanceReport.reset();
      });
    }
    else {
      console.log('form is invalid')
      this.markFormGroupTouched(this.addAdvanceReport);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


  getAdvanceCategoryByUserId() {
    this.expenseService.getAdvanceCategoryByUserId(this.addAdvanceReport.value.employee).subscribe((res: any) => {
      if (res.status === "failure" || !res.details || res.details.length === 0) {
        this.toast.error('Advance Category is not assigned to the selected employee', 'Error');
      } else {
        this.categoriesByUser = res.details;
      }
    }, (error) => {
      this.toast.error('Failed to fetch advance category. Please try again later.', 'Error');
    });
  }

  onEmployeeSelected() {
    this.getAdvanceCategoryByUserId();
  }

  getCategory(categoryId: string) {
    const matchingCategory = this.allAdvanceCategories?.find(category => category._id === categoryId);
    return matchingCategory ? `${matchingCategory.label}` : 'Category Not Found';
  }


  closeModal() {
    this.close.emit(true);
  }

}