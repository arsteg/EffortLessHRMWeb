import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ExportService } from 'src/app/_services/export.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { Subscription } from 'rxjs/internal/Subscription';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

@Component({
  selector: 'app-leave-category',
  templateUrl: './leave-category.component.html',
  styleUrls: ['./leave-category.component.css']
})
export class LeaveCategoryComponent implements OnInit, OnDestroy {
  categoryForm: FormGroup;
  selectedLeaveCategory: any;
  isEdit: boolean = false;
  sortOrder: string = '';
  displayedColumns: string[] = ['label', 'leaveType', 'leaveAccrualPeriod', 'actions'];
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100];
  closeResult: string = '';
  allData: any[] = [];
  allDatatemp: any[] = [];
  dialogRef: MatDialogRef<any> | null = null;
  private leaveTypeSubscription: Subscription;
  totalRecords: any = 0;
  isSubmitting: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  columns: TableColumn[] = [
    {
      key: 'label',
      name: 'Leave Label'
    },
    {
      key: 'leaveType',
      name: 'Leave Type'
    },
    {
      key: 'leaveAccrualPeriod',
      name: 'Frequency Of Accrual'
    },
    {
      key: 'actions',
      name: 'Action',
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  constructor(
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
      label: ['', [Validators.required, CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      abbreviation: ['', [Validators.required, CustomValidators.labelValidator]],
      canEmployeeApply: [true, Validators.required],
      isHalfDayTypeOfLeave: [true, Validators.required],
      submitBefore: [0, [Validators.required, Validators.min(0)]],
      displayLeaveBalanceInPayslip: [true, Validators.required],
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
      minimumNumberOfDaysAllowed: [0, [Validators.required, Validators.min(0)]],
      isProRateFirstMonthAccrualForNewJoinees: [''],
      dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth: [0],
      maximumNumberConsecutiveLeaveDaysAllowed: [0, [Validators.required, Validators.min(0)]],
      isPaidLeave: [true],
      carryoverMaxDaysLimit: [0],
      encashmentMaxDaysLimit: [0],
      fnfMaxDaysLimit: [0],
      negativeLeaveBalancePolicy: ['none'],
    }, { validators: this.minLessThanMaxValidator });
    this.leaveTypeSubscription = this.categoryForm.get('leaveType')?.valueChanges.subscribe(value => {
      const leaveAccrualPeriodControl = this.categoryForm.get('leaveAccrualPeriod');
      if (value === 'general-leave') {
        leaveAccrualPeriodControl?.setValidators([Validators.required]);
      } else {
        leaveAccrualPeriodControl?.clearValidators();
        leaveAccrualPeriodControl?.setValue(''); // Clear value for non-general leave types
      }
      leaveAccrualPeriodControl?.updateValueAndValidity();
    });

    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      const searchString = filter.toLowerCase();
      return data.label.toLowerCase().includes(searchString) ||
        data.leaveType.toLowerCase().includes(searchString) ||
        (data.leaveAccrualPeriod?.toLowerCase().includes(searchString) || false);
    });
  }
  minLessThanMaxValidator: ValidatorFn = (group: AbstractControl) => {
    const min = group.get('minimumNumberOfDaysAllowed')?.value;
    const max = group.get('maximumNumberConsecutiveLeaveDaysAllowed')?.value;
    if (
      min !== null && min !== undefined &&
      max !== null && max !== undefined &&
      min > 0 && max > 0 &&
      min > max
    ) {
      group.get('minimumNumberOfDaysAllowed')?.setErrors({ minNotLessThanMax: true });
      return { minNotLessThanMax: true };
    } else {
      // Only clear this specific error, not others
      const minCtrl = group.get('minimumNumberOfDaysAllowed');
      if (minCtrl?.hasError('minNotLessThanMax')) {
        const errors = { ...minCtrl.errors };
        delete errors['minNotLessThanMax'];
        minCtrl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  };

  ngOnInit(): void {
    this.getAllLeaveCategories();
  }

  ngOnDestroy(): void {
    if (this.leaveTypeSubscription) {
      this.leaveTypeSubscription.unsubscribe();
    }
  }

  reset() {
    this.isEdit = false;
    this.categoryForm.reset({
      leaveType: '',
      label: '',
      abbreviation: '',
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
      dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth: 0,
      isPaidLeave: false,
      submitBefore: 0,
      minimumNumberOfDaysAllowed: 0,
      maximumNumberConsecutiveLeaveDaysAllowed: 0,
      leaveAccrualPeriod: '',
      carryoverMaxDaysLimit: 0,
      encashmentMaxDaysLimit: 0,
      fnfMaxDaysLimit: 0,
      negativeLeaveBalancePolicy: 'none',
    });
    this.categoryForm.get('leaveAccrualPeriod')?.clearValidators();
    this.categoryForm.get('leaveAccrualPeriod')?.updateValueAndValidity();
  }

  onLeaveTypeChange() {
    this.isSubmitting = false;
    if (this.isEdit === false) {
      const currentLeaveType = this.categoryForm.get('leaveType')?.value;
      this.categoryForm.reset({
        leaveType: currentLeaveType,
        label: '',
        abbreviation: '',
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
        submitBefore: 0,
        minimumNumberOfDaysAllowed: 0,
        maximumNumberConsecutiveLeaveDaysAllowed: 0,
        leaveAccrualPeriod: '',
        carryoverMaxDaysLimit: 0,
        encashmentMaxDaysLimit: 0,
        fnfMaxDaysLimit: 0,
        negativeLeaveBalancePolicy: 'none',
        dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth: 0,
      });
    }
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.isSubmitting = false;
    });
  }

  getAllLeaveCategories() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.leaveService.getAllLeaveCategories(pagination).subscribe((res: any) => {
      this.allData = res.data;
      this.allDatatemp = res.data;
      this.totalRecords = res.total;
    });
  }
  onLabelChange() {
    this.categoryForm.get('label').valueChanges.subscribe(() => {
      this.isSubmitting = false;
    });
  }

  onSubmission() {
    this.isSubmitting = true;
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      return;
    }
    else {
      if (!this.isEdit) {
        this.leaveService.addLeaveCategory(this.categoryForm.value).subscribe(
          (res: any) => {
            this.tableService.setData([...this.tableService.dataSource.data, res.data]);
            this.isSubmitting = false;
            this.toast.success(res.message);
            this.dialogRef.close(true);
            this.reset();
            this.getAllLeaveCategories();
          },
          (err) => {
            this.toast.error(err);
          }
        );
      } else if (this.isEdit) {
        const id = this.selectedLeaveCategory._id;
        this.leaveService.updateLeaveCategory(id, this.categoryForm.value).subscribe(
          (res: any) => {
            this.isSubmitting = false;
            const updatedData = this.tableService.dataSource.data.map(item =>
              item._id === res.data._id ? res.data : item
            );
            this.tableService.setData(updatedData);
            this.toast.success(res.message);
            this.dialogRef.close(true);
            this.reset();
            this.getAllLeaveCategories();
          },
          (err) => {
            this.toast.error(err || this.translate.instant('leave.leaveErrorAssignmentUpdated'));
          }
        );
      }
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
      //leaveAccrualPeriod: this.selectedLeaveCategory.leaveAccrualPeriod,
      leaveAccrualPeriod: this.selectedLeaveCategory.leaveAccrualPeriod || '',
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
      isProRateFirstMonthAccrualForNewJoinees: this.selectedLeaveCategory.isProRateFirstMonthAccrualForNewJoinees,
      dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth: this.selectedLeaveCategory.dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth || 0,
      minimumNumberOfDaysAllowed: this.selectedLeaveCategory.minimumNumberOfDaysAllowed,
      maximumNumberConsecutiveLeaveDaysAllowed: this.selectedLeaveCategory.maximumNumberConsecutiveLeaveDaysAllowed,
      isPaidLeave: this.selectedLeaveCategory.isPaidLeave,
      carryoverMaxDaysLimit: this.selectedLeaveCategory.carryoverMaxDaysLimit || 0,
      encashmentMaxDaysLimit: this.selectedLeaveCategory.encashmentMaxDaysLimit || 0,
      fnfMaxDaysLimit: this.selectedLeaveCategory.fnfMaxDaysLimit || 0,
      negativeLeaveBalancePolicy: this.selectedLeaveCategory.negativeLeaveBalancePolicy || 'none',
    });
    const leaveAccrualPeriodControl = this.categoryForm.get('leaveAccrualPeriod');
    if (this.selectedLeaveCategory.leaveType === 'general-leave') {
      leaveAccrualPeriodControl?.setValidators([Validators.required]);
    } else {
      leaveAccrualPeriodControl?.clearValidators();
    }
    leaveAccrualPeriodControl?.updateValueAndValidity();
  }

  exportToCsv() {
    const dataToExport = this.tableService.dataSource.data;
    this.exportService.exportToCSV('Leave-Category', 'Leave-Category', dataToExport);
  }

  deleteTemplate(_id: string) {
    this.leaveService.deleteLeaveCategory(_id).subscribe(
      (res: any) => {
        this.toast.success(this.translate.instant('leave.leaveCategoryDelete'));
        this.getAllLeaveCategories(); // <-- Refresh list after delete
      },
      (err) => {
        const errorMessage = err || this.translate.instant('leave.leaveCategoryDeleteError');
        this.toast.error(errorMessage);
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

  handleAction(event: any, contant: any) {
    if (event.action.label === 'Edit') {
      this.open(contant);
      this.selectedLeaveCategory = event?.row;
      this.editCategory();
    }
    if (event.action.label === 'Delete') {
      this.deleteDialog(event?.row?._id);
    }
  }

  onPageChange(event: any) { // CHANGED: Updated to match reference
    this.tableService.currentPage = event.pageIndex + 1;
    this.tableService.recordsPerPage = event.pageSize;
    this.getAllLeaveCategories();
  }

  onSortChange(event: any) { // CHANGED: Updated to match reference
    const sorted = this.allData.slice().sort((a: any, b: any) => {
      const valueA = a[event.active];
      const valueB = b[event.active];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.allData = sorted;
  }

  onSearchChange(event: string) { // CHANGED: Updated to match reference
    this.allData = this.allDatatemp.filter(row => {
      return this.columns.some(col => {
        if (col.key !== 'actions') {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(event.toLowerCase());
        }
        return false;
      });
    });
  }

  close() {
    this.reset();
    this.dialogRef.close(this);
  }
}