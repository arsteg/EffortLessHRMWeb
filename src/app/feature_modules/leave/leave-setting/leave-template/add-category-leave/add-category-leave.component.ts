import { Component, EventEmitter, Input, Output, resolveForwardRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-category-leave',
  templateUrl: './add-category-leave.component.html',
  styleUrl: './add-category-leave.component.css'
})
export class AddCategoryLeaveComponent {
  @Output() close: any = new EventEmitter();
  @Output() changeStep: any = new EventEmitter();
  @Output() updateLeaveTemplateTable: EventEmitter<void> = new EventEmitter<void>();
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
  users: FormGroup;
  defaultCatSkip="0";
  defaultCatNext="100000";

  constructor(private leaveService: LeaveService,
    private location : Location,
    private router : Router,
    private _formBuilder: FormBuilder,
    private commonService: CommonService,
    private toast: ToastrService) {
  }

  ngOnInit() {
   this.leaveService.selectedTemplate.subscribe(res=>{
      console.log(res);
    })
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });

    this.router.navigateByUrl('home/leave', { skipLocationChange: true }).then(() => {
      this.router.navigate([this.router.url]);
  });

    this.leaveService.selectedTemplate.subscribe((selectedTemplate) => {
      this.firstForm = this._formBuilder.group({
        leaveCategories: this._formBuilder.array([]),
        leaveTemplate: [this.leaveService.selectedTemplate.getValue()._id]
      });

      const leaveCategoriesArray = this.firstForm.get('leaveCategories') as FormArray;
      const requestBody = { "skip": this.defaultCatSkip, "next": this.defaultCatNext };
      this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
        this.allCategories = res.data;

        this.leaveService.getLeaveTemplateCategoriesByTemplateId(selectedTemplate._id).subscribe((res: any) => {
          this.leaveCategories = res.data;

          this.steps = this.leaveCategories;

          this.steps.forEach(step => {
            const matchingCategory = this.allCategories.find(category => category?._id === step?.leaveCategory);

            if (matchingCategory) {
              const categoryId = matchingCategory._id;

              const leaveCategoryGroup = this._formBuilder.group({
                leaveCategory: [categoryId, Validators.required],
              limitNumberOfTimesApply: [true],
              maximumNumbersEmployeeCanApply: [0, [Validators.min(0)]],
              maximumNumbersEmployeeCanApplyType: [''],
              dealWithNewlyJoinedEmployee: ['', Validators.required],
              daysToCompleteToBecomeEligibleForLeave: [0, [Validators.min(0)]],
              isEmployeeGetCreditedTheEntireAmount: [true],
              extendLeaveCategory: [true],
              extendMaximumDayNumber: [0, [Validators.min(0)]],
              extendFromCategory: [''],
              negativeBalanceCap: [0, [Validators.min(0)]],
              accrualRatePerPeriod: [1, [Validators.required, Validators.min(1)]],  // Validation for accrual rate
              categoryApplicable: ['all-employees'],
              users: ['']
              });
              leaveCategoriesArray.push(leaveCategoryGroup);
            }
            const formGroupIndex = leaveCategoriesArray.length - 1;
            let users = step.templateApplicableCategoryEmployee.map(user => user.user);
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
              categoryApplicable: step.categoryApplicable || 'all-employees',
              users: users
            });
          });
        });
      });
    });
  }

  getUserName(userId: string): string {
    const user = this.members.find(member => member.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  closeModal() {
    this.changeStep.emit(1);
    this.firstForm.reset();
    this.close.emit(true);
    this.updateLeaveTemplateTable.emit();
  }

  getCategoryLabel(leaveCategoryId: string): string {
    const matchingCategory = this.allCategories?.find(category => category._id === leaveCategoryId);
    return matchingCategory.label;
  }

  onSubmit() {
    const templateId = this.leaveService.selectedTemplate.getValue()._id;
    this.firstForm.value.leaveCategories.forEach((category: any) => {
      category.users = category.users.map((user: any) => ({ user }));
    });
    this.leaveService.updateLeaveTemplateCategories(this.firstForm.value).subscribe((res: any) => {
      this.updateLeaveTemplateTable.emit();
      this.toast.success('Leave Template Categories Updated', 'Successfully');
      this.closeModal();
    });
  }

}
