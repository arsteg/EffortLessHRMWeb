import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';

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
  @Input() changeMode: string;
  @Input() selectedRecord: any;
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
    if (this.changeMode == 'Update') {
      this.addAdvanceReport.patchValue(this.selectedRecord)
      this.expenseService.getAdvanceCategoryByUserId(this.selectedRecord.employee).subscribe(
        (res: any) => {
          if (res.status === "failure" || !res.details || res.details.length === 0 || res.details == null) {
            this.toast.error('Advance Category is not assigned to the selected Employee', 'Error');
          } else {
            this.categoriesByUser = res.details;
            console.log('Categories:', this.categoriesByUser);

            // Patch the category after categoriesByUser is populated
            this.addAdvanceReport.patchValue({
              category: this.selectedRecord.category
            });
          }
        },
        (error) => {
          this.toast.error('Failed to fetch advance category. Please try again later.', 'Error');
        }
      );
    }
    if (this.changeMode == 'Add') {
      this.addAdvanceReport.reset({
        employee: '',
        category: '',
        status: 'Level 1 Approval Pending',
        comment: '',
        amount: ''
      })
    }
    let payload = {
      next: '', skip: ''
    }
    this.expenseService.getAdvanceCatgories(payload).subscribe((res: any) => {
      this.allCategory = res.data;
    });
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getAllAdvanceCategories();
  }

  getAllAdvanceCategories() {
    let payload = {
      next: '', skip: ''
    }
    this.expenseService.getAdvanceCatgories(payload).subscribe((res: any) => {
      this.allAdvanceCategories = res.data;
      console.log(res.data);
    })
  }

  resetFormValues() {
    if (this.changeMode === 'Update') {
      // Reset the form with the initial values from selectedRecord
      this.addAdvanceReport.patchValue({
        employee: this.selectedRecord.employee,
        amount: this.selectedRecord.amount,
        comment: this.selectedRecord.comment,
        status: this.selectedRecord.status,
        category: null // Reset category temporarily
      });
  
      // Fetch the categories for the employee
      this.expenseService.getAdvanceCategoryByUserId(this.selectedRecord.employee).subscribe(
        (res: any) => {
          if (res.status === "failure" || !res.details || res.details.length === 0 || res.details == null) {
            this.toast.error('Advance Category is not assigned to the selected Employee', 'Error');
          } else {
            this.categoriesByUser = res.details;
  
            // Patch the category after categoriesByUser is ready
            this.addAdvanceReport.patchValue({
              category: this.selectedRecord.category
            });
          }
        },
        (error) => {
          this.toast.error('Failed to fetch advance category. Please try again later.', 'Error');
        }
      );
    }
  
    if (this.changeMode === 'Add') {
      // Reset the form to initial state for Add mode
      this.addAdvanceReport.reset({
        employee: '',
        category: '',
        status: 'Level 1 Approval Pending',
        comment: '',
        amount: ''
      });
      this.categoriesByUser = []; // Clear categories for Add mode
    }
  }
  

  onSubmission() {
    if (this.addAdvanceReport.valid) {
      if (this.changeMode == 'Add') {
        this.expenseService.addAdvanceReport(this.addAdvanceReport.value).subscribe((res: any) => {
          this.advanceReportRefreshed.emit();
          this.expenseService.advanceReport.next(res.data);
          this.addAdvanceReport.reset({
            employee: '',
            category: '',
            status: 'Level 1 Approval Pending',
            comment: '',
            amount: ''
          });
        });
      }
      if (this.changeMode == 'Update') {
        this.expenseService.updateAdvanceReport(this.selectedRecord._id, this.addAdvanceReport.value).subscribe((res: any) => {
          this.advanceReportRefreshed.emit();
          this.expenseService.advanceReport.next(res.data);
          this.addAdvanceReport.reset({
            employee: '',
            category: '',
            status: 'Level 1 Approval Pending',
            comment: '',
            amount: ''
          });
          this.changeMode = 'Add'
        })
      }
    }
    else {
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

  onEmployeeSelected() {
    this.getAdvanceCategoryByUserId(this.addAdvanceReport.value.employee);
  }

  getAdvanceCategoryByUserId(employeeId: string) {
    this.expenseService.getAdvanceCategoryByUserId(employeeId).subscribe(
      (res: any) => {
        if (res.status === "failure" || !res.details || res.details.length === 0 || res.details == null) {
          this.toast.error('Advance Category is not assigned to the selected Employee', 'Error');
        } else {
          this.categoriesByUser = res.details;
          console.log('Categories:', this.categoriesByUser);
        }
      },
      (error) => {
        this.toast.error('Failed to fetch advance category. Please try again later.', 'Error');
      }
    );
  }


  getCategory(categoryId: string) {
    const matchingCategory = this.allAdvanceCategories?.find(category => category?._id === categoryId);
    return matchingCategory ? matchingCategory?.label : '';
  }

  closeModal() {
    this.close.emit(true);
  }

}
