import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-add-advance-report',
  templateUrl: './add-advance-report.component.html',
  styleUrl: './add-advance-report.component.css'
})
export class AddAdvanceReportComponent {
  private translate: TranslateService = inject(TranslateService);
  addAdvanceReport: FormGroup;
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
      this.addAdvanceReport.patchValue(this.selectedRecord);
      this.getAdvanceCategoryByUserId(this.selectedRecord.employee);
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
    this.commonService.populateUsers().subscribe(result => {this.allAssignee = result.data.data || [];});
    this.getAllAdvanceCategories();
  }

  getAllAdvanceCategories() {
    let payload = {
      next: '', skip: ''
    }
    this.expenseService.getAdvanceCatgories(payload).subscribe((res: any) => {
      this.allAdvanceCategories = res.data;
    })
  }

  onSubmission() {
    if (this.addAdvanceReport.valid) {
      if (this.changeMode == 'Add') {
        this.expenseService.addAdvanceReport(this.addAdvanceReport.value).subscribe((res: any) => {
          this.advanceReportRefreshed.emit();
          this.expenseService.advanceReport.next(res.data);
          this.closeModal();
        });
      }
      if (this.changeMode == 'Update') {
        this.expenseService.updateAdvanceReport(this.selectedRecord._id, this.addAdvanceReport.value).subscribe((res: any) => {
          this.advanceReportRefreshed.emit();
          this.expenseService.advanceReport.next(res.data);
          this.closeModal();
        })
      }
    }
    
  }

  onEmployeeSelected() {
    this.getAdvanceCategoryByUserId(this.addAdvanceReport.value.employee);
  }

  getAdvanceCategoryByUserId(employeeId: string) {
    this.expenseService.getAdvanceCategoryByUserId(employeeId).subscribe(
      (res: any) => {
        if (!res.details.length) {
          this.toast.error(this.translate.instant("expenses.advance_category_not_assigned"));
          this.categoriesByUser = [];
          this.addAdvanceReport.get('category').disable();
        } else {
          this.categoriesByUser = res.details;
          this.addAdvanceReport.get('category').enable();

          if(this.changeMode === 'Update'){
            this.addAdvanceReport.patchValue({
              category: this.selectedRecord.category
            });
          }
        }
      },
      (error) => {
        this.toast.error(error || this.translate.instant("expenses.advance_category_not_fetched"));
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
