import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ExportService } from 'src/app/_services/export.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';

@Component({
  selector: 'app-leave-category',
  templateUrl: './leave-category.component.html',
  styleUrls: ['./leave-category.component.css']
})
export class LeaveCategoryComponent implements OnInit, AfterViewInit {
  categoryForm: FormGroup;
  selectedLeaveCategory: any;
  isEdit: boolean = false;
  sortOrder: string = '';
  displayedColumns: string[] = ['label', 'leaveType', 'leaveAccrualPeriod', 'actions'];
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100];
  closeResult: string = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private modalService: NgbModal,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private exportService: ExportService,
    private translate: TranslateService,
    public tableService: TableService<any>
  ) {
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
    });

    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      const searchString = filter.toLowerCase();
      return data.label.toLowerCase().includes(searchString) ||
             data.leaveType.toLowerCase().includes(searchString) ||
             (data.leaveAccrualPeriod?.toLowerCase().includes(searchString) || false);
    });
  }

  ngOnInit(): void {
    this.getAllLeaveCategories();
  }

  ngAfterViewInit() {
    this.tableService.initializeDataSource([]);
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
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
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.leaveService.getAllLeaveCategories(pagination).subscribe((res: any) => {
      this.tableService.setData(res.data);
      this.tableService.totalRecords = res.total;
    });
  }

  onSubmission() {
    if (this.categoryForm.valid) {
      if (!this.isEdit) {
        this.leaveService.addLeaveCategory(this.categoryForm.value).subscribe(
          (res: any) => {
            this.tableService.setData([...this.tableService.dataSource.data, res.data]);
            this.toast.success(this.translate.instant('leave.leaveSuccessfulAssigned'));
            this.reset();
            this.modalService.dismissAll();
          },
          (err) => {
            this.toast.error(this.translate.instant('leave.leaveErrorAssigned'));
          }
        );
      } else {
        const id = this.selectedLeaveCategory._id;
        this.leaveService.updateLeaveCategory(id, this.categoryForm.value).subscribe(
          (res: any) => {
            const updatedData = this.tableService.dataSource.data.map(item =>
              item._id === res.data._id ? res.data : item
            );
            this.tableService.setData(updatedData);
            this.toast.success(this.translate.instant('leave.leaveSuccessfulAssignmentUpdated'));
            this.reset();
            this.modalService.dismissAll();
          },
          (err) => {
            this.toast.error(this.translate.instant('leave.leaveErrorAssignmentUpdated'));
          }
        );
      }
    } else {
      this.markFormGroupTouched(this.categoryForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  editCategory() {
    this.isEdit = true;
    this.categoryForm.patchValue({
      leaveType: this.selectedLeaveCategory.leaveType,
      label: this.selectedLeaveCategory.label,
      abbreviation: this.selectedLeaveCategory.abbreviation,
      canEmployeeApply: this.selectedLeaveCategory.canEmployeeApply,
      isHalfDayTypeOfLeave: this.selectedLeaveCategory.isHalfDayTypeOfLeave,
      submitBefore: this.selectedLeaveCategory.submitBefore || 0,
      displayLeaveBalanceInPayslip: this.selectedLeaveCategory.displayLeaveBalanceInPayslip,
      leaveAccrualPeriod: this.selectedLeaveCategory.leaveAccrualPeriod,
      isAnnualHolidayLeavePartOfNumberOfDaysTaken: this.selectedLeaveCategory.isAnnualHolidayLeavePartOfNumberOfDaysTaken,
      isWeeklyOffLeavePartOfNumberOfDaysTaken: this.selectedLeaveCategory.isWeeklyOffLeavePartOfNumberOfDaysTaken,
      isEligibleForLeaveEncashmentDuringRollover: this.selectedLeaveCategory.isEligibleForLeaveEncashmentDuringRollover,
      isDocumentRequired: this.selectedLeaveCategory.isDocumentRequired,
      isDocumentMandatory: this.selectedLeaveCategory.isDocumentMandatory,
      isEligibleForEncashmentRecoveryDuringFNF: this.selectedLeaveCategory.isEligibleForEncashmentRecoveryDuringFNF,
      isWeeklyOffHolidayPartHalfDayIncludedDaTaken: this.selectedLeaveCategory.isWeeklyOffHolidayPartHalfDayIncludedDaTaken,
      policyWithRegardsToCarryoverLimits: this.selectedLeaveCategory.policyWithRegardsToCarryoverLimits,
      isEmployeesAllowedToNegativeLeaveBalance: this.selectedLeaveCategory.isEmployeesAllowedToNegativeLeaveBalance,
      isRoundOffLeaveAccrualNearestPointFiveUnit: this.selectedLeaveCategory.isRoundOffLeaveAccrualNearestPointFiveUnit,
      isIntraCycleLapseApplicableForThisCategory: this.selectedLeaveCategory.isIntraCycleLapseApplicableForThisCategory,
      minimumNumberOfDaysAllowed: this.selectedLeaveCategory.minimumNumberOfDaysAllowed,
      isProRateFirstMonthAccrualForNewJoinees: this.selectedLeaveCategory.isProRateFirstMonthAccrualForNewJoinees,
      maximumNumberConsecutiveLeaveDaysAllowed: this.selectedLeaveCategory.maximumNumberConsecutiveLeaveDaysAllowed,
      dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth: this.selectedLeaveCategory.dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth,
      dayOfMonthEmployeeNeedToResignToGetCreditforTheMonth: this.selectedLeaveCategory.dayOfMonthEmployeeNeedToResignToGetCreditforTheMonth,
      isPaidLeave: this.selectedLeaveCategory.isPaidLeave,
      isEmployeeAccrualLeaveInAdvance: this.selectedLeaveCategory.isEmployeeAccrualLeaveInAdvance
    });
  }

  exportToCsv() {
    const dataToExport = this.tableService.dataSource.data;
    this.exportService.exportToCSV('Leave-Category', 'Leave-Category', dataToExport);
  }

  deleteTemplate(_id: string) {
    this.leaveService.deleteLeaveCategory(_id).subscribe(
      (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(this.translate.instant('leave.leaveSuccessfulAssignmentDeleted'));
      },
      (err) => {
        this.toast.error(this.translate.instant('leave.leaveErrorAssignmentDeleted'));
      }
    );
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

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getAllLeaveCategories();
  }
}