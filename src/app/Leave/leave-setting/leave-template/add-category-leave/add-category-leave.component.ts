import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
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
  firstForm: any;
  categories: any;
  steps: any;
  template: any;
  @Input() isEdit: boolean;
  members: any;


  constructor(private leaveService: LeaveService,
    private _formBuilder: FormBuilder,
    private commonService: CommonService) { }

  ngOnInit() {
    // this.populateUsers();
    this.commonService.populateUsers().subscribe((res: any)=>{
      this.members = res.data.data;
    })
    // this.template = this.leaveService.selectedTemplate.getValue();
    // console.log(this.template);

    // -------------
    // let id = this.leaveService.selectedTemplate.getValue()._id;
    // this.leaveService.getLeaveTemplateById(id).subscribe((res: any) => {
    //   let categoryList = res.data;
    //   this.categories = categoryList.map(category => ({ expensecategory: category.expenseCategory }));
    // });

    // this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
    //   this.categories = res;
    //   // let category = this.leaveService.categories.getValue();
    //   this.steps = this.categories.expenseCategories;

    //   // this.firstForm = this._formBuilder.group({
    //   //   leaveCategory: this._formBuilder.array([]),
    //   //   expenseTemplate: [this.leaveService.selectedTemplate.getValue()._id]
    //   // });

    //   const expenseCategoriesArray = this.firstForm.get('expenseCategories') as FormArray;

    //   // Add form groups for each category
    //   this.steps.forEach(step => {
    //     const matchingCategory = this.categories.find(category => category._id === step.expenseCategory);

    //     if (matchingCategory) {
    //       const categoryId = matchingCategory._id;
    //       expenseCategoriesArray.push(this._formBuilder.group({
    //         // expenseCategory: categoryId,
    //         // isMaximumAmountPerExpenseSet: false,
    //         // maximumAmountPerExpense: 0,
    //         // isMaximumAmountWithoutReceiptSet: false,
    //         // maximumAmountWithoutReceipt: 0,
    //         // maximumExpensesCanApply: 0,
    //         // isTimePeroidSet: false,
    //         // timePeroid: '',
    //         // expiryDay: 0,
    //         // isEmployeeCanAddInTotalDirectly: false,
    //         // ratePerDay: 0
    //       }));
    //     }
    //   });
    // });

    // -----------
  }

 

  closeModal() {
    this.changeStep.emit(1);
    this.firstForm.reset();
    this.close.emit(true);
  }

  getLeaveCategories() {
    this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
    })
  }

  getCategoryLabel(expenseCategoryId: string): string {
    const matchingCategory = this.categories.find(category => category._id === expenseCategoryId);
    return matchingCategory ? matchingCategory.label : '';
  }
  
}
