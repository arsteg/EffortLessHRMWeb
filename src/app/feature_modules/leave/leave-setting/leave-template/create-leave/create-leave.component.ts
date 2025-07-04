import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-leave',
  templateUrl: './create-leave.component.html',
  styleUrl: './create-leave.component.css'
})
export class CreateLeaveComponent {
  @Input() changeMode: any;
  @Output() close: any = new EventEmitter();
  @Output() changeStep: any = new EventEmitter();
  @Input() selectedTemplate: any;
  addTemplateForm: FormGroup;
  users: any = [];
  categories: any;
  @Input() isEdit: boolean;
  categoryList: any;
  skip: string = '0';
  next = '10000';

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.addTemplateForm = this.fb.group({
      label: ['', Validators.required],
      approvalLevel: ['1-level', Validators.required],
      approvalType: ['employee-wise', Validators.required],
      primaryApprover: [''],
      secondaryApprover: [''],
      isCommentMandatory: [true],
      clubbingRestrictions: [false, Validators.required],
      weeklyOffClubTogether: [true],
      holidayClubTogether: [true],
      leaveCategories: [[], Validators.required],
      clubbingRestrictionCategories: this.fb.array([])
    });
  }

  ngOnInit() {
    this.setFormValues();
    this.getAllUsers();
    this.getLeaveCategories();

    this.addTemplateForm.get('approvalLevel')?.valueChanges.subscribe((value: any) => {
      this.validateApprovers(this.addTemplateForm.get('approvalType')?.value, value);
    });
    this.addTemplateForm.get('approvalType')?.valueChanges.subscribe((value: any) => {
      this.validateApprovers(value, this.addTemplateForm.get('approvalLevel')?.value);
    });
  }

  validateApprovers(approverType: string, approverLevel: string) {
    if (approverLevel === '1 Level' && approverType === 'template-wise') {
      this.addTemplateForm.get('primaryApprover')?.setValidators([Validators.required]);
      this.addTemplateForm.get('secondaryApprover')?.clearValidators();
    } else if (approverLevel === '2 Level' && approverType === 'template-wise') {
      this.addTemplateForm.get('primaryApprover')?.setValidators([Validators.required]);
      this.addTemplateForm.get('secondaryApprover')?.setValidators([Validators.required]);
    } else {
      this.addTemplateForm.get('primaryApprover')?.clearValidators();
      this.addTemplateForm.get('secondaryApprover')?.clearValidators();
    }
    this.addTemplateForm.get('primaryApprover')?.updateValueAndValidity();
    this.addTemplateForm.get('secondaryApprover')?.updateValueAndValidity();
  }

  setFormValues() {
    if (this.changeMode === 'Add') {
      this.addTemplateForm.reset();
    }
    const templateData = this.selectedTemplate;
    if (this.changeMode === 'Next') {
      console.log(templateData);
      // Map applicableCategories to an array of _id strings
      let leaveCategories = templateData?.applicableCategories
        ? templateData.applicableCategories.map(category => category.leaveCategory._id)
        : [];

      this.addTemplateForm.patchValue({
        label: templateData.label,
        approvalLevel: templateData.approvalLevel,
        approvalType: templateData.approvalType,
        primaryApprover: templateData.primaryApprover,
        secondaryApprover: templateData.secondaryApprover,
        isCommentMandatory: templateData.isCommentMandatory,
        clubbingRestrictions: templateData.clubbingRestrictions,
        weeklyOffClubTogether: templateData.weeklyOffClubTogether,
        holidayClubTogether: templateData.holidayClubTogether,
        leaveCategories: leaveCategories,
        clubbingRestrictionCategories: templateData.clubbingRestrictionCategories || []
      });
    }
  }

  addClubbedCategory(): void {
    const categoryGroup = this.fb.group({
      leaveCategory: ['', Validators.required],
      restrictedClubbedLeaveCategory: ['', Validators.required]
    });
    (this.addTemplateForm.get('clubbingRestrictionCategories') as FormArray).push(categoryGroup);
  }

  getLeaveCategories() {
    const requestBody = { skip: this.skip, next: this.next };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
      this.categories = res.data;
      this.leaveService.categories.next(this.categories);
    },
      error => {
        this.toast.error(this.translate.instant('leave.errorFetchingCategories'));
      }
    );
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe({
      next: (res: any) => {
        this.users = res.data.data;
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingUsers'));
      }
    });
  }

  closeModal() {
    this.close.emit(true);
    this.leaveService.selectedTemplate.next('');
    this.addTemplateForm.reset();
    //this.toast.success(this.translate.instant('leave.modalClosed'));
  }

  onSubmission() {
    const payload = {
      label: this.addTemplateForm.value.label,
      approvalLevel: this.addTemplateForm.value.approvalLevel,
      approvalType: this.addTemplateForm.value.approvalType,
      primaryApprover: this.addTemplateForm.value.primaryApprover,
      secondaryApprover: this.addTemplateForm.value.secondaryApprover,
      isCommentMandatory: this.addTemplateForm.value.isCommentMandatory,
      clubbingRestrictions: this.addTemplateForm.value.clubbingRestrictions,
      weeklyOffClubTogether: this.addTemplateForm.value.weeklyOffClubTogether,
      holidayClubTogether: this.addTemplateForm.value.holidayClubTogether,
      clubbingRestrictionCategories: this.addTemplateForm.value.clubbingRestrictionCategories,
      leaveCategories: this.addTemplateForm.value.leaveCategories.map(category => ({ leaveCategory: category }))
    };

    if (this.addTemplateForm.valid) {
      if (this.changeMode === 'Add') {
        this.leaveService.addLeaveTemplate(payload).subscribe({
          next: (res: any) => {
            this.leaveService.selectedTemplate.next(res.data);
            this.leaveService.categories.next(res.categories);
            this.changeStep.emit(2);
            this.toast.success(this.translate.instant('leave.successTemplateCreated'));
          },
          error: () => {
            this.toast.error(this.translate.instant('leave.errorCreatingTemplate'));
          }
        });
      } else {
        const id = this.leaveService.selectedTemplate.getValue()._id;
        this.leaveService.updateLeaveTemplate(id, payload).subscribe((res: any) => {
          // this.leaveService.selectedTemplate.next(res.data);
          // this.leaveService.categories.next(res.categories);
          this.changeStep.emit(2);
          this.toast.success(this.translate.instant('leave.successTemplateUpdated'));
        },
          error => {
            this.toast.error(this.translate.instant('leave.errorUpdatingTemplate'));
          }
        );
      }
    } else {
      this.addTemplateForm.markAllAsTouched();
      this.toast.warning(this.translate.instant('leave.invalidForm'));
    }
  }

  get clubbingRestrictionCategories() {
    return this.addTemplateForm.get('clubbingRestrictionCategories') as FormArray;
  }

  removeCategory(index: number) {
    const category = this.clubbingRestrictionCategories.at(index);
    if (category.value.id) {
      console.log(category.value.id); // Placeholder for deletion logic
      this.clubbingRestrictionCategories.removeAt(index);
      this.toast.success(this.translate.instant('leave.categoryRemoved'));
    } else {
      this.clubbingRestrictionCategories.removeAt(index);
      this.toast.success(this.translate.instant('leave.categoryRemoved'));
    }
  }

  getCategoryLabel(leaveCategoryId: string): string {
    const matchingCategory = this.categories?.find(category => category._id === leaveCategoryId);
    return matchingCategory ? matchingCategory.label : '';
  }

  getUserName(userId: string): string {
    const user = this.users.find(member => member.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : '';
  }
}