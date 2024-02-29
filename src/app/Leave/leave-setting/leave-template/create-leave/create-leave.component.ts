import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-create-leave',
  templateUrl: './create-leave.component.html',
  styleUrl: './create-leave.component.css'
})
export class CreateLeaveComponent {
  @Input() changeMode: any;
  @Output() close: any = new EventEmitter();
  addTemplateForm: FormGroup;
  users: any = [];
  @Output() changeStep: any = new EventEmitter();
  categories: any;
  @Input() isEdit: boolean;

  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService) {
    this.addTemplateForm = this.fb.group({
      label: ['', Validators.required],
      approvalLevel: ['', Validators.required],
      approvalType: ['', Validators.required],
      primaryApprover: ['', Validators.required],
      secondaryApprover: ['', Validators.required],
      isCommentMandatory: [true, Validators.required],
      clubbingRestrictions: [, Validators.required],
      weeklyOffClubTogether: [true, Validators.required],
      holidayClubTogether: [true, Validators.required],
      leaveCategories: [[], Validators.required],
      cubbingRestrictionCategories: this.fb.array([])
    })
  }

  ngOnInit() {
    this.getAllUsers();
    this.getLeaveCatgeories();
    this.leaveService.selectedTemplate.subscribe((template: any) => {
      if (template._id) {
        this.setFormValues(template)
      }
    });
    console.log(this.changeMode)
  }

  setFormValues(templateData: any) {
    this.leaveService.getLeaveTemplateById(templateData._id).subscribe((res: any) => {
      let categoryList = res.data;
      let leaveCategories = categoryList.applicableCategories.map(category => ({ applicableCategories: category?.leaveCategory }));
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
        cubbingRestrictionCategories: templateData.cubbingRestrictionCategories,
        leaveCategories: leaveCategories
      });

    });
  }
  addClubbedCategory(): void {
    const categoryGroup = this.fb.group({
      leaveCategory: ['', Validators.required],
      restrictedclubbedLeaveCategory: ['', Validators.required]
    });

    (this.addTemplateForm.get('cubbingRestrictionCategories') as FormArray).push(categoryGroup);
  }

  getLeaveCatgeories() {
    this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
      this.categories = res.data;
    })
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }
  closeModal() {
    this.close.emit(true);
    this.leaveService.selectedTemplate.next('');
  }

  compareExpenseCategories(category1: any, category2: any): boolean {
    return category1 && category2 ? category1._id === category2._id : category1 === category2;
  }

  onSubmission() {
    console.log('clicked')
    let payload = {
      label: this.addTemplateForm.value.label,
      approvalLevel: this.addTemplateForm.value.approvalLevel,
      approvalType: this.addTemplateForm.value.approvalType,
      primaryApprover: this.addTemplateForm.value.primaryApprover,
      secondaryApprover: this.addTemplateForm.value.secondaryApprover,
      isCommentMandatory: this.addTemplateForm.value.isCommentMandatory,
      clubbingRestrictions: this.addTemplateForm.value.clubbingRestrictions,
      weeklyOffClubTogether: this.addTemplateForm.value.weeklyOffClubTogether,
      holidayClubTogether: this.addTemplateForm.value.holidayClubTogether,
      cubbingRestrictionCategories: this.addTemplateForm.value.cubbingRestrictionCategories,
      leaveCategories: this.addTemplateForm.value.leaveCategories.map(category => ({ leaveCategory: category }))
    }
    console.log(payload);
    if (this.changeMode == 'Add') {
      this.leaveService.addLeaveTemplate(payload).subscribe((res: any) => {
        this.leaveService.selectedTemplate.next(res.data);
        this.changeStep.emit(2);
      })
    }
    else {
      console.log(this.changeMode)
      this.changeStep.emit(2);
    }
  }

  get cubbingRestrictionCategories() {
    return this.addTemplateForm.get('cubbingRestrictionCategories') as FormArray;
  }

  removeCatgory(index: number) {
    if (this.cubbingRestrictionCategories.value[index].id) {
      console.log(this.cubbingRestrictionCategories.value[index].id)
      // this.leaveService.deleteApplicationField(this.cubbingRestrictionCategories.value[index].id).subscribe((res: any) => {
      this.cubbingRestrictionCategories.removeAt(index);
      // });
    }
    else {
      this.cubbingRestrictionCategories.removeAt(index);
    }
  }
 

}
