import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExportService } from 'src/app/_services/export.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-leave-Category',
  templateUrl: './leave-category.component.html',
  styleUrls: ['./leave-category.component.css'],
  // encapsulation: ViewEncapsulation.None
})
export class LeaveCategoryComponent implements OnInit {
  searchText: string = '';
  closeResult: string = '';
  leaveCategory: any;
  changeMode: 'Add' | 'Update' = 'Add';
  categoryForm: FormGroup;
  selectedLeaveCategory: any;
  isEdit: boolean = false;
  public sortOrder: string = ''; // 'asc' or 'desc'
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100]; // Add the available options for records per page
  recordsPerPage: number = 10; // Default records per page
  totalRecords: number = 0; // Total number of records
  currentPage: number = 1;
  skip: string = '0';
  next = '10';

  constructor(private modalService: NgbModal,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private exportService: ExportService) {
    this.categoryForm = this.fb.group({
      leaveType: ['', Validators.required],
      label: ['', Validators.required],
      abbreviation: ['', Validators.required],
      canEmployeeApply: [true, Validators.required],
      isHalfDayTypeOfLeave: [true, Validators.required],
      submitBefore: [0, Validators.required],
      displayLeaveBalanceInPayslip: [true, Validators.required],
      leaveAccrualPeriod: ['', Validators.required],
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
      isPaidLeave: [true],
      isEmployeeAccrualLeaveInAdvance: [true]
    })
  }

  ngOnInit(): void {
    this.getAllLeaveCategories();
  }
  reset() {
    this.isEdit = false;
    this.categoryForm.reset({
      canEmployeeApply: false,
      isHalfDayTypeOfLeave: false,
      displayLeaveBalanceInPayslip: false,
      isAnnualHolidayLeavePartOfNumberOfDaysTaken: false,
      isWeeklyOffLeavePartOfNumberOfDaysTaken: false,
      isEligibleForLeaveEncashmentDuringRollover: false,
      isDocumentRequired: false,
      isDocumentMandatory: false,
      isEligibleForEncashmentRecoveryDuringFNF: false,
      isWeeklyOffHolidayPartHalfDayIncludedDaTaken: false,
      isEmployeesAllowedToNegativeLeaveBalance: false,
      isRoundOffLeaveAccrualNearestPointFiveUnit: false,
      isIntraCycleLapseApplicableForThisCategory: false,
      isProRateFirstMonthAccrualForNewJoinees: false,
      isPaidLeave: false,
      isEmployeeAccrualLeaveInAdvance: false,
      submitBefore: 0,
      minimumNumberOfDaysAllowed: 0,
      maximumNumberConsecutiveLeaveDaysAllowed: 0,
      dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth: 0,
      dayOfMonthEmployeeNeedToResignToGetCreditforTheMonth: 0
    });
  }
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
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
    const requestBody = { "skip": this.skip, "next": this.next };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
      this.leaveCategory = res.data;
      this.totalRecords = res && res.total
      this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
    })
  }

  onSubmission() {
    if (this.categoryForm.valid) {
      if (!this.isEdit) {
        this.leaveService.addLeaveCategory(this.categoryForm.value).subscribe((res: any) => {
          const leaveCategory = res.data;
          this.leaveCategory.push(leaveCategory);
          this.toast.success('Leave Category Created', 'Successfully!!!');
         this.reset();
        },
          err => {
            this.toast.error('Leave Category Can not be Created', 'Error!!!')
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
            this.reset();
          }
        },
          err => {
            this.toast.error('Leave Category Can not be updated', 'Error!!!')
          });
      }
    }
    else {
      this.categoryForm.markAllAsTouched();
    }
  }
  getLeaveCategoryById() {
    if (this.isEdit) {
      this.leaveService.getLeaveCategorById(this.selectedLeaveCategory._id).subscribe((res: any) => {
        this.categoryForm.patchValue(res.data)
        console.log(this.categoryForm.value);
      })
    }
  }
  editCategory() {
    const leaveCategory = this.selectedLeaveCategory;
    this.isEdit = true;
    this.categoryForm.patchValue({
      leaveType: leaveCategory.leaveType,
      label: leaveCategory.label,
      abbreviation: leaveCategory.abbreviation,
      canEmployeeApply: leaveCategory.canEmployeeApply,
      isHalfDayTypeOfLeave: leaveCategory.isHalfDayTypeOfLeave,
      submitBefore: leaveCategory.submitBefore || 0,
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
      isPaidLeave: leaveCategory.isPaidLeave,
      isEmployeeAccrualLeaveInAdvance: leaveCategory.isEmployeeAccrualLeaveInAdvance
    })
  }

  exportToCsv() {
    const dataToExport = this.leaveCategory;
    this.exportService.exportToCSV('Leave-Category', 'Leave-Category', dataToExport);
  }

  deleteTemplate(_id: string) {
    this.leaveService.deleteLeaveCategory(_id).subscribe((res: any) => {
      const index = this.leaveCategory.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.leaveCategory.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Leave Category')
    },
      (err) => {
        this.toast.error('This Category is already being used!'
          , 'Leave Category, Can not be deleted!')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }

  // //Pagging related functions
  nextPagination() {
    if (!this.isNextButtonDisabled()) {
      const newSkip = (parseInt(this.skip) + parseInt(this.next)).toString();
      this.skip = newSkip;
      this.getAllLeaveCategories();
    }
  }

  previousPagination() {
    if (!this.isPreviousButtonDisabled()) {
      const newSkip = (parseInt(this.skip) >= parseInt(this.next)) ? (parseInt(this.skip) - parseInt(this.next)).toString() : '0';
      this.skip = newSkip;
      this.getAllLeaveCategories();
    }
  }
  firstPagePagination() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.skip = '0';
      this.next = this.recordsPerPage.toString();
      this.getAllLeaveCategories();
    }
  }
  lastPagePagination() {
    const totalPages = this.getTotalPages();
    if (this.currentPage !== totalPages) {
      this.currentPage = totalPages;
      this.updateSkip();
      this.getAllLeaveCategories();
    }
  }
  updateSkip() {
    const newSkip = (this.currentPage - 1) * this.recordsPerPage;
    this.skip = newSkip.toString();
  }

  isNextButtonDisabled(): boolean {
    return this.currentPage === this.getTotalPages();
  }

  isPreviousButtonDisabled(): boolean {
    return this.skip === '0' || this.currentPage === 1;
  }
  updateRecordsPerPage() {
    this.currentPage = 1;
    this.skip = '0';
    this.next = this.recordsPerPage.toString();
    this.getAllLeaveCategories();
  }
  getTotalPages(): number {
    const totalCount = this.totalRecords;
    return Math.ceil(totalCount / this.recordsPerPage);
  }
}