import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

@Component({
  selector: 'app-add-category-leave',
  templateUrl: './add-category-leave.component.html',
  styleUrl: './add-category-leave.component.css',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ]
})
export class AddCategoryLeaveComponent {
  private readonly translate = inject(TranslateService);
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() changeStep: EventEmitter<number> = new EventEmitter<number>();
  @Output() updateLeaveTemplateTable: EventEmitter<void> = new EventEmitter<void>();
  @Input() selectedTemplate: any;
  @Input() isEdit: boolean = false;
  firstForm: FormGroup;
  allCategories: any[] = [];
  leaveCategories: any[] = [];
  members: any[] = [];
  loader: boolean = true;
  defaultCatSkip = "0";
  defaultCatNext = "100000";

  constructor(
    private leaveService: LeaveService,
    private _formBuilder: FormBuilder,
    private commonService: CommonService,
    private toast: ToastrService
  ) {}

  ngOnInit() {
    if(!this.isEdit) {
      this.selectedTemplate = this.leaveService.selectedTemplate.getValue();
    }
    this.firstForm = this._formBuilder.group({
      leaveCategories: this._formBuilder.array([]),
      leaveTemplate: [this.selectedTemplate?._id || this.leaveService.selectedTemplate.getValue()._id]
    });

    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });

    const requestBody = { skip: this.defaultCatSkip, next: this.defaultCatNext };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
      this.allCategories = res.data;

      this.leaveService.getLeaveTemplateCategoriesByTemplateId(this.firstForm.get('leaveTemplate').value).subscribe((res: any) => {
        this.loader = false;
        this.leaveCategories = res.data;

        const leaveCategoriesArray = this.firstForm.get('leaveCategories') as FormArray;
        leaveCategoriesArray.clear();

        this.leaveCategories.forEach(step => {
          const matchingCategory = this.allCategories.find(category => category?._id === step?.leaveCategory?._id || category?._id === step?.leaveCategory);
          if (matchingCategory) {
            const categoryId = matchingCategory._id;
            this.leaveService.getLeaveCategorById(categoryId).subscribe((categoryDetails: any) => {
              const leaveCategoryGroup = this._formBuilder.group({
                leaveCategory: [categoryId, Validators.required],
                limitNumberOfTimesApply: [step.limitNumberOfTimesApply ?? true, Validators.required],
                maximumNumbersEmployeeCanApply: [step.maximumNumbersEmployeeCanApply ?? 0, [Validators.min(0)]],
                maximumNumbersEmployeeCanApplyType: [step.maximumNumbersEmployeeCanApplyType || ''],
                dealWithNewlyJoinedEmployee: [step.dealWithNewlyJoinedEmployee ?? '1', Validators.required],
                daysToCompleteToBecomeEligibleForLeave: [step.daysToCompleteToBecomeEligibleForLeave ?? 0, [Validators.min(0)]],
                isEmployeeGetCreditedTheEntireAmount: [step.isEmployeeGetCreditedTheEntireAmount ?? true, Validators.required],
                extendLeaveCategory: [step.extendLeaveCategory ?? true],
                extendMaximumDayNumber: [step.extendMaximumDayNumber ?? 0, [Validators.min(0)]],
                extendFromCategory: [step.extendFromCategory || ''],
                negativeBalanceCap: [step.negativeBalanceCap ?? 0, [Validators.min(0)]],
                accrualRatePerPeriod: [step.accrualRatePerPeriod ?? 1, [Validators.required, Validators.min(1)]],
                categoryApplicable: [step.categoryApplicable || 'all-employees', Validators.required],
                users: [step.templateApplicableCategoryEmployee?.map(user => user.user) || []]
              });
              leaveCategoriesArray.push(leaveCategoryGroup);
              this.toggleControl(leaveCategoryGroup, 'limitNumberOfTimesApply', 'maximumNumbersEmployeeCanApply');
            }, err => {
              this.toast.error(this.translate.instant('leave.templateCategories.errorLoadingCategoryDetails'));
            });
          }
        });
      }, err => {
        this.loader = false;
        this.toast.error(this.translate.instant('leave.templateCategories.errorLoadingCategories'));
      });
    }, err => {
      this.loader = false;
      this.toast.error(this.translate.instant('leave.templateCategories.errorLoadingAllCategories'));
    });
  }

  toggleControl(formGroup: FormGroup, toggler: string, control: string) {
    if (!formGroup.get(toggler).value) {
      formGroup.get(control).disable();
    }
    formGroup.get(toggler).valueChanges.subscribe(value => {
      if (value) {
        formGroup.get(control).enable();
      } else {
        formGroup.get(control).disable();
      }
    });
  }

  getCategoryLabel(leaveCategoryId: string): string {
    const matchingCategory = this.allCategories.find(category => category._id === leaveCategoryId);
    return matchingCategory ? matchingCategory.label : 'Unknown Category';
  }

  getUserName(userId: string): string {
    const user = this.members.find(member => member.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  onSubmit() {
    const formData = { ...this.firstForm.value };
    formData.leaveCategories.forEach(category => {
      category.users = category.users.map(user => ({ user }));
    });
    this.leaveService.updateLeaveTemplateCategories(formData).subscribe((res: any) => {
      this.toast.success(this.translate.instant('leave.successTemplateCategoriesUpdated'));
      this.updateLeaveTemplateTable.emit();
      this.closeModal();
    }, err => {
      this.toast.error(err?.message || this.translate.instant('leave.errorTemplateCategoriesUpdated'));
    });
  }

  closeModal() {
    this.changeStep.emit(1);
    this.close.emit(true);
  }
}