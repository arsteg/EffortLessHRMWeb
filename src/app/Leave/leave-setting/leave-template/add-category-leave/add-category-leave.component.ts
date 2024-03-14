import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-add-category-leave',
  templateUrl: './add-category-leave.component.html',
  styleUrl: './add-category-leave.component.css'
})
export class AddCategoryLeaveComponent {
  @Output() close: any = new EventEmitter();
  @Output() changeStep: any = new EventEmitter();
  @Output() updateExpenseTemplateTable: EventEmitter<void> = new EventEmitter<void>();
  step = 1;
  firstForm: FormGroup;
  categories: any;
  steps: any;
  template: any;
  @Input() isEdit: boolean;
  members: any = [];
  leaveCategories: any;
  allCategories: any;
  categoryForm: FormGroup;

  constructor(private leaveService: LeaveService,
    private _formBuilder: FormBuilder,
    private commonService: CommonService,
    private toast: ToastrService) {
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
    this.leaveService.selectedTemplate.subscribe((selectedTemplate) => {
      this.firstForm = this._formBuilder.group({
        leaveCategories: this._formBuilder.array([]),
        leaveTemplate: [this.leaveService.selectedTemplate.getValue()._id]
      });
      console.log(this.firstForm.value);

      const leaveCategoriesArray = this.firstForm.get('leaveCategories') as FormArray;
      this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
        this.allCategories = res.data;

        // let templateId = this.leaveService.selectedTemplate.getValue()._id;
        this.leaveService.getLeaveTemplateCategoriesByTemplateId(selectedTemplate._id).subscribe((res: any) => {
          this.leaveCategories = res.data;

          this.steps = this.leaveCategories;
          console.log(this.steps);
          console.log(this.allCategories);
          this.steps.forEach(step => {
            const matchingCategory = this.allCategories.find(category => category?._id === step?.leaveCategory);
            console.log(matchingCategory)
            if (matchingCategory) {
              const categoryId = matchingCategory._id;
              leaveCategoriesArray.push(this._formBuilder.group({
                leaveCategory: categoryId,
                limitNumberOfTimesApply: true,
                maximumNumbersEmployeeCanApply: 0,
                maximumNumbersEmployeeCanApplyType: '',
                dealWithNewlyJoinedEmployee: '',
                daysToCompleteToBecomeEligibleForLeave: 0,
                isEmployeeGetCreditedTheEntireAmount: true,
                extendLeaveCategory: true,
                extendMaximumDayNumber: 0,
                extendFromCategory: '',
                negativeBalanceCap: 0,
                accrualRatePerPeriod: 0,
                categoryApplicable: 'all-employees'
              }));
              const formGroupIndex = leaveCategoriesArray.length - 1;
              leaveCategoriesArray.at(formGroupIndex).patchValue({
                limitNumberOfTimesApply: step.limitNumberOfTimesApply,
                maximumNumbersEmployeeCanApply: step.maximumNumbersEmployeeCanApply,
                maximumNumbersEmployeeCanApplyType: step.maximumNumbersEmployeeCanApplyType,
                dealWithNewlyJoinedEmployee: step.dealWithNewlyJoinedEmployee,
                daysToCompleteToBecomeEligibleForLeave: step.daysToCompleteToBecomeEligibleForLeave,
                isEmployeeGetCreditedTheEntireAmount: step.isEmployeeGetCreditedTheEntireAmount,
                extendLeaveCategory: step.extendLeaveCategory,
                extendMaximumDayNumber: step.extendMaximumDayNumber,
                extendFromCategory: step.extendFromCategory,
                negativeBalanceCap: step.negativeBalanceCap,
                accrualRatePerPeriod: step.accrualRatePerPeriod,
                categoryApplicable: step.categoryApplicable
              });
            }
          });
        })
      })
    })
  }


  closeModal() {
    this.changeStep.emit(1);
    this.firstForm.reset();
    this.close.emit(true);
  }

  getLeaveCategories() {
    this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
      this.allCategories = res.data;
    })
  }

  getCategoryLabel(leaveCategoryId: string): string {
    const matchingCategory = this.allCategories?.find(category => category._id === leaveCategoryId);
    return matchingCategory.label;
  }

  // getLeaveCategoriesById() {
  //   let templateId = this.leaveService.selectedTemplate.getValue()._id;
  //   this.leaveService.getLeaveApplicableCategoriesByTemplateId(templateId).subscribe((res: any) => {
  //     console.log(res.data);
  //     this.leaveCategories = res.data;
  //   })
  // }



  onSubmit() {
    const templateId = this.leaveService.selectedTemplate.getValue()._id;
    this.leaveService.updateLeaveTemplateCategories(this.firstForm.value).subscribe((res: any) => {
      this.toast.success('Leave Template Categories Updated', 'Successfully');
    })
    console.log('formSubmitted', this.firstForm.value)
  }
}
