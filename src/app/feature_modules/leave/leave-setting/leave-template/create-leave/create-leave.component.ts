import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
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
  @Input() templates: any;
  @Output() updateLeaveTemplateTable: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private toast: ToastrService,
    private translate: TranslateService,
    private teamService: ManageTeamService
  ) {

    this.addTemplateForm = this.fb.group({
      label: ['', [Validators.required, CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
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
    this.addTemplateForm.get('clubbingRestrictions').disable();
  }

  ngOnInit() {
    this.setFormValues();
    this.getManagers();
    this.getLeaveCategories();
    this.addTemplateForm.get('approvalType')?.valueChanges.subscribe((value: any) => {
      if (value === 'template-wise') {
        this.addTemplateForm.get('primaryApprover')?.setValidators([Validators.required]);
      }
      this.addTemplateForm.patchValue({
        primaryApprover: null
      })
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
      this.addTemplateForm.reset({
        label: '',
        approvalType: 'employee-wise',
        primaryApprover: '',
        secondaryApprover: '',
        isCommentMandatory: true,
        clubbingRestrictions: false,
        weeklyOffClubTogether: true,
        holidayClubTogether: true,
        leaveCategories: []
      });
    }
    const templateData = this.selectedTemplate;
    if (this.changeMode === 'Next') {
      // Map applicableCategories to an array of _id strings
      let leaveCategories = templateData?.applicableCategories
        ? templateData.applicableCategories.map(category => category.leaveCategory._id)
        : [];

      this.addTemplateForm.patchValue({
        label: templateData.label,
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

  getManagers() {
    this.teamService.getManagers().subscribe((res: any) => {
      this.users = res.data;
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingUsers'));
      }
    });
  }

  closeModal() {
    this.close.emit(true);
    this.leaveService.selectedTemplate.next('');
    this.addTemplateForm.reset();
  }

  onSubmission() {
    this.addTemplateForm.get('clubbingRestrictions').enable();
    this.addTemplateForm.value.clubbingRestrictions = false;

    const categories = this.addTemplateForm.value.leaveCategories.map(category => ({ leaveCategory: category }));
    if (this.addTemplateForm.value.approvalType === 'employee-wise') {
      this.addTemplateForm.patchValue({
        primaryApprover: null,
        secondaryApprover: null,
        leaveCategories : categories
      })
    
    if (this.addTemplateForm.valid) {
      if (this.changeMode === 'Add') {
        this.leaveService.addLeaveTemplate(this.addTemplateForm.value).subscribe((res: any) => {
          this.leaveService.selectedTemplate.next(res.data);
          this.leaveService.categories.next(res.categories);
          this.updateLeaveTemplateTable.emit();
          this.changeStep.emit(2);
          this.toast.success(this.translate.instant('leave.successTemplateCreated'));
        },
          error => {
            this.toast.error(error || this.translate.instant('leave.errorCreatingTemplate'));
          }
        );
      } else if (this.changeMode === 'Next') {
        const id = this.leaveService.selectedTemplate.getValue()._id;
        this.leaveService.updateLeaveTemplate(id, this.addTemplateForm.value).subscribe((res: any) => {
          this.updateLeaveTemplateTable.emit();
          this.changeStep.emit(2);
          this.toast.success(this.translate.instant('leave.successTemplateUpdated'));
        },
          error => {
            this.toast.error(error || this.translate.instant('leave.errorUpdatingTemplate'));
          }
        );
      }
    } else {
      this.addTemplateForm.markAllAsTouched();
      this.addTemplateForm.get('clubbingRestrictions').disable();
      this.toast.warning(this.translate.instant('leave.invalidForm'));
    }
  }
    this.addTemplateForm.get('clubbingRestrictions').disable();
  }

  get clubbingRestrictionCategories() {
    return this.addTemplateForm.get('clubbingRestrictionCategories') as FormArray;
  }

  removeCategory(index: number) {
    const category = this.clubbingRestrictionCategories.at(index);
    if (category.value.id) {
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