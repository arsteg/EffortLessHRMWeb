import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ExportService } from 'src/app/_services/export.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { Subscription } from 'rxjs/internal/Subscription';

const labelValidator: ValidatorFn = (control: AbstractControl) => {
  const value = control.value as string;
  if (!value || /^\s*$/.test(value)) {
    return { required: true };
  }
  const valid = /^(?=.*[a-zA-Z])[a-zA-Z\s(),\-/]*$/.test(value);
  return valid ? null : { invalidLabel: true };
};
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
  dialogRef: MatDialogRef<any> | null = null;
  private leaveTypeSubscription: Subscription;
  totalRecords: any = 0;

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
      label: ['', [Validators.required, labelValidator, this.duplicateLabelValidator()]],
      abbreviation: ['', Validators.required],
      canEmployeeApply: [true, Validators.required],
      isHalfDayTypeOfLeave: [true, Validators.required],
      submitBefore: [0, [Validators.required, Validators.min(0)]], // Already there, good!
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
      minimumNumberOfDaysAllowed: [0, [Validators.required, Validators.min(0)]], // Add min(0)
      isProRateFirstMonthAccrualForNewJoinees: [''],
      maximumNumberConsecutiveLeaveDaysAllowed: [0, [Validators.required, Validators.min(0)]], // Add min(0)
      isPaidLeave: [true],
      isEmployeeAccrualLeaveInAdvance: [true]
    });
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

  ngOnInit(): void {
    this.getAllLeaveCategories();
  }

  ngOnDestroy(): void {
    if (this.leaveTypeSubscription) {
      this.leaveTypeSubscription.unsubscribe();
    }
  }

  duplicateLabelValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const label = control.value;
      if (label && this.allData.length) {
        if (this.isEdit && this.selectedLeaveCategory?.label.toLowerCase() === label.toLowerCase()) {
          return null;
        }
        const isDuplicate = this.allData.some(template =>
          template._id !== (this.isEdit ? this.selectedLeaveCategory?._id : '') &&
          template.label.toLowerCase() === label.toLowerCase()
        );
        return isDuplicate ? { duplicateLabel: true } : null;
      }
      return null;
    };
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
      isPaidLeave: false,
      isEmployeeAccrualLeaveInAdvance: false,
      submitBefore: 0,
      minimumNumberOfDaysAllowed: 0,
      maximumNumberConsecutiveLeaveDaysAllowed: 0,
      leaveAccrualPeriod: ''
    });
    this.categoryForm.get('leaveAccrualPeriod')?.clearValidators();
    this.categoryForm.get('leaveAccrualPeriod')?.updateValueAndValidity();
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });
    this.dialogRef.afterClosed().subscribe(result => {
    });
  }

  getAllLeaveCategories() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.leaveService.getAllLeaveCategories(pagination).subscribe((res: any) => {
      this.allData = res.data;
      this.totalRecords = res.total;
    });
  }

  onSubmission() {
    if (this.categoryForm.valid) {
      if (!this.isEdit) {
        this.leaveService.addLeaveCategory(this.categoryForm.value).subscribe(
          (res: any) => {
            this.tableService.setData([...this.tableService.dataSource.data, res.data]);
            this.toast.success(this.translate.instant('leave.leaveSuccessfulAssigned'));
            this.dialogRef.close(true);
            this.reset();
          },
          (err) => {
            this.toast.error(this.translate.instant('leave.leaveErrorAssigned'));
          }
        );
      } else if (this.isEdit) {
        const id = this.selectedLeaveCategory._id;
        this.leaveService.updateLeaveCategory(id, this.categoryForm.value).subscribe(
          (res: any) => {
            const updatedData = this.tableService.dataSource.data.map(item =>
              item._id === res.data._id ? res.data : item
            );
            this.tableService.setData(updatedData);
            this.toast.success(this.translate.instant('leave.leaveSuccessfulAssignmentUpdated'));
            this.dialogRef.close(true);
            this.reset();
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
      minimumNumberOfDaysAllowed: this.selectedLeaveCategory.minimumNumberOfDaysAllowed,
      isProRateFirstMonthAccrualForNewJoinees: this.selectedLeaveCategory.isProRateFirstMonthAccrualForNewJoinees,
      maximumNumberConsecutiveLeaveDaysAllowed: this.selectedLeaveCategory.maximumNumberConsecutiveLeaveDaysAllowed,
      isPaidLeave: this.selectedLeaveCategory.isPaidLeave,
      isEmployeeAccrualLeaveInAdvance: this.selectedLeaveCategory.isEmployeeAccrualLeaveInAdvance
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
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(this.translate.instant('leave.leaveSuccessfulAssignmentDeleted'));
      },
      (err) => {
        const errorMessage = err || this.translate.instant('leave.leaveErrorAssignmentDeleted');
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
    const sorted = this.tableService.dataSource.data.slice().sort((a: any, b: any) => {
      const valueA = a[event.active];
      const valueB = b[event.active];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.tableService.dataSource.data = sorted;
  }

  onSearchChange(event: string) { // CHANGED: Updated to match reference
    this.tableService.dataSource.data = this.allData.filter(row => {
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