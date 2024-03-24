import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-leave-balance',
  templateUrl: './leave-balance.component.html',
  styleUrl: './leave-balance.component.css'
})
export class LeaveBalanceComponent {
  leaveBalanceForm: FormGroup;
  members: any = [];
  leaveBalance: any;
  leaveCategories: any;
  selectedUser: any;
  allCategories: any;

  constructor(private leaveService: LeaveService,
    private fb: FormBuilder,
    private commonService: CommonService) {
    this.leaveBalanceForm = this.fb.group({
      user: [''],
      cycle: [''],
      category: ['']
    });
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
    this.getAllLeaveCatgeories();
  }

  getLeaveBalance() {
    let payload = {
      user: this.leaveBalanceForm.value.user,
      cycle: this.leaveBalanceForm.value.cycle,
      category: this.leaveBalanceForm.value.category
    }
    this.leaveService.getLeaveBalance(payload).subscribe((res: any) => {
      this.leaveBalance = res.data;
    })
  }

  getAllLeaveCatgeories() {
    this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
      this.allCategories = res.data;
    })
  }

  selecteduser(user) {
    console.log(user);
    this.leaveService.getLeaveCategoriesByUser(user).subscribe((res: any) => {
      this.leaveCategories = res.data;
    })
  }
  getCategoriesByUser() {
    this.leaveService.getLeaveCategoriesByUser(this.selectedUser).subscribe((res: any) => {
      this.leaveCategories = res.data;
    })
  }

  getlaveCategoryLabel(categoryId: string) {
    const category = this.allCategories.find(category => category._id === categoryId);
    return category ? category.label : '';
  }
}
