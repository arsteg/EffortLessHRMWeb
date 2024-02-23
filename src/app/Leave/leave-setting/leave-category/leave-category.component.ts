import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExportService } from 'src/app/_services/export.service';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-leave-Category',
  templateUrl: './leave-category.component.html',
  styleUrls: ['./leave-category.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LeaveCategoryComponent implements OnInit {
  searchText: string = '';
  closeResult: string = '';
  leaveCategory: any;
  changeMode: 'Add' | 'Update' = 'Add';
  categoryForm: FormGroup;
  selectedLeaveCategory: any;
  isEdit: boolean = false;

  constructor(private modalService: NgbModal,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private exportService: ExportService) {
    this.categoryForm = this.fb.group({
      leaveType: [''],
      label: [''],
      abbreviation: [''],
      canEmployeeApply: [true],
      isHalfDayTypeOfLeave: [true],
      submitBefore: [0],
      displayLeaveBalanceInPayslip: [true],
      leaveAccrualPeriod: [''],
      isAnnualHolidayLeavePartOfNumberOfDaysTaken: [true],
      isWeeklyOffLeavePartOfNumberOfDaysTaken: [true],
      isEligibleForLeaveEncashmentDuringRollover: [true],
      isDocumentRequired: [true],
      isDocumentMandatory: [true],
      isEligibleForEncashmentRecoveryDuringFNF: [true],
      isWeeklyOffHolidayPartHalfDayIncludedDaTaken: [true],
      policyWithRegardsToCarryoverLimits: [''],
      isEmployeesAllowedToNegativeLeaveBalance: [true],
      isRoundOffLeaveAccrualNearestPointFiveUnit: [true],
      isIntraCycleLapseApplicableForThisCategory: [true],
      minimumNumberOfDaysAllowed: [0],
      isProRateFirstMonthAccrualForNewJoinees: [''],
      maximumNumberConsecutiveLeaveDaysAllowed: [0],
      dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth: [0],
      dayOfMonthEmployeeNeedToResignToGetCreditforTheMonth: [0],
      isPaidLeave: [true]
    })
  }

  ngOnInit(): void {
    this.getAllLeaveCategories();
  }
  reset() {
    this.isEdit = false;
    this.categoryForm.reset();
  }
  open(content: any) {
    this.modalService.open(content, { windowClass: 'custom-modal-lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getAllLeaveCategories() {
    this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
      this.leaveCategory = res.data;
    })
  }

  onSubmission() {
    if (!this.isEdit) {
      this.leaveService.addLeaveCategory(this.categoryForm.value).subscribe((res: any) => {
        const leaveCategory = res.data;
        this.leaveCategory.push(leaveCategory);
        this.toast.success('New Expense Category Added', 'Successfully!!!');
      },
        err => {
          this.toast.error('Leave Category Can not be Added', 'Error!!!')
        });
    }
    else {
      const id = this.selectedLeaveCategory._id
      this.leaveService.updateLeaveCategory(id, this.categoryForm.value).subscribe((res: any) => {
        const updatedLeaveCategory = res.data;
        const index = this.leaveCategory.findIndex(category => category._id === updatedLeaveCategory._id);
        if (index !== -1) {
          this.leaveCategory[index] = updatedLeaveCategory;
          this.toast.success('Leave Category Updated', 'Successfully!!!');
        }
      },
        err => {
          this.toast.error('Leave Category Can not be updated', 'Error!!!')
        });
    }
  }
  editCategory(leaveCategory) {
    this.isEdit = true;
    this.categoryForm.patchValue({
      leaveType: leaveCategory.leaveType,
      label: leaveCategory.label,
      abbreviation: leaveCategory.abbreviation,
      canEmployeeApply: leaveCategory.canEmployeeApply,
      isHalfDayTypeOfLeave: leaveCategory.isHalfDayTypeOfLeave,
      submitBefore: leaveCategory.submitBefore,
      displayLeaveBalanceInPayslip: leaveCategory.displayLeaveBalanceInPayslip,
      leaveAccrualPeriod: leaveCategory.leaveAccrualPeriod,
      isAnnualHolidayLeavePartOfNumberOfDaysTaken: leaveCategory.isAnnualHolidayLeavePartOfNumberOfDaysTaken,
      isWeeklyOffLeavePartOfNumberOfDaysTaken: leaveCategory.isWeeklyOffLeavePartOfNumberOfDaysTaken,
      isEligibleForLeaveEncashmentDuringRollover: leaveCategory.isEligibleForLeaveEncashmentDuringRollover,
      isDocumentRequired: leaveCategory.isDocumentRequired,
      isDocumentMandatory: leaveCategory.isDocumentMandatory,
      isEligibleForEncashmentRecoveryDuringFNF: leaveCategory.isEligibleForEncashmentRecoveryDuringFNF,
      isWeeklyOffHolidayPartHalfDayIncludedDaTaken: leaveCategory.isWeeklyOffHolidayPartHalfDayIncludedDaTaken,
      policyWithRegardsToCarryoverLimits: leaveCategory.policyWithRegardsToCarryoverLimits,
      isEmployeesAllowedToNegativeLeaveBalance: leaveCategory.isEmployeesAllowedToNegativeLeaveBalance,
      isRoundOffLeaveAccrualNearestPointFiveUnit: leaveCategory.isRoundOffLeaveAccrualNearestPointFiveUnit,
      isIntraCycleLapseApplicableForThisCategory: leaveCategory.isIntraCycleLapseApplicableForThisCategory,
      minimumNumberOfDaysAllowed: leaveCategory.minimumNumberOfDaysAllowed,
      isProRateFirstMonthAccrualForNewJoinees: leaveCategory.isProRateFirstMonthAccrualForNewJoinees,
      maximumNumberConsecutiveLeaveDaysAllowed: leaveCategory.maximumNumberConsecutiveLeaveDaysAllowed,
      dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth: leaveCategory.dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth,
      dayOfMonthEmployeeNeedToResignToGetCreditforTheMonth: leaveCategory.dayOfMonthEmployeeNeedToResignToGetCreditforTheMonth,
      isPaidLeave: leaveCategory.isPaidLeave
    })
  }

  exportToCsv() {
    const dataToExport = this.leaveCategory;
    this.exportService.exportToCSV('Leave-Category', 'Leave-Category', dataToExport);
  }
}