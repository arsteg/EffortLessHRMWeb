import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  categoryList: any;

  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService) {
    this.addTemplateForm = this.fb.group({
      label: ['', Validators.required],
      approvalLevel: ['', Validators.required],
      approvalType: ['', Validators.required],
      primaryApprover: [''],
      secondaryApprover: [''],
      isCommentMandatory: [true],
      clubbingRestrictions: [false, Validators.required],
      weeklyOffClubTogether: [true],
      holidayClubTogether: [true],
      leaveCategories: new FormControl([]) ,
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
  }

  setFormValues(templateData: any) {
    this.leaveService.getLeaveTemplateById(templateData._id).subscribe((res: any) => {
      this.categoryList = res.data;
      let leaveCategories = this.categoryList.applicableCategories.map(category => category?.leaveCategory);
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

  

  onSubmission() {
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
    if (this.changeMode == 'Add') {
      this.leaveService.addLeaveTemplate(payload).subscribe((res: any) => {
        this.leaveService.selectedTemplate.next(res.data);
        this.changeStep.emit(2);
      })
    }
    else {
      const id = this.leaveService.selectedTemplate.getValue()._id;
      this.leaveService.updateLeaveTemplate(id, payload).subscribe((res: any)=>{
        this.leaveService.selectedTemplate.next(res.data);
        this.changeStep.emit(2);
      })
      
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
