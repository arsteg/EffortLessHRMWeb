import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'; // Import AbstractControl
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';

@Component({
  selector: 'app-variable-allowance',
  templateUrl: './variable-allowance.component.html',
  styleUrls: ['./variable-allowance.component.css']
})
export class VariableAllowanceComponent implements OnInit, AfterViewInit {
  variableAllowanceForm: FormGroup;
  selectedRecord: any;
  isEdit: boolean = false;
  members: any[];
  months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  years: number[] = [];
  dialogRef: MatDialogRef<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private payroll: PayrollService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private commonService: CommonService,
    private translate: TranslateService,
    public tableService: TableService<any>
  ) {
    this.variableAllowanceForm = this.fb.group({
      label: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      allowanceRatePerDay: [0, [Validators.required, Validators.min(0)]],
      isPayrollEditable: [false],
      isProvidentFundAffected: [false],
      isESICAffected: [false],
      isLWFAffected: [false],
      isIncomeTaxAffected: [false],
      deductIncomeTaxAllowance: [null],
      taxRegime: [[]],
      paidAllowanceFrequently: ['', Validators.required],
      allowanceEffectiveFromMonth: ['', Validators.required],
      allowanceEffectiveFromYear: ['', Validators.required],
      isEndingPeriod: [false],
      allowanceStopMonth: [''],
      allowanceStopYear: [''],
      isProfessionalTaxAffected: [false]
    }, { validators: this.periodValidator() });

    // Update validators dynamically based on isEndingPeriod
    this.variableAllowanceForm.get('isEndingPeriod')?.valueChanges.subscribe(value => {
      const stopMonthControl = this.variableAllowanceForm.get('allowanceStopMonth');
      const stopYearControl = this.variableAllowanceForm.get('allowanceStopYear');
      if (value) {
        stopMonthControl?.setValidators(Validators.required);
        stopYearControl?.setValidators(Validators.required);
      } else {
        stopMonthControl?.clearValidators();
        stopYearControl?.clearValidators();
        stopMonthControl?.setValue('');
        stopYearControl?.setValue('');
      }
      stopMonthControl?.updateValueAndValidity({ emitEvent: false });
      stopYearControl?.updateValueAndValidity({ emitEvent: false });
      this.variableAllowanceForm.updateValueAndValidity();
    });

    // Subscribe to period fields to trigger validation
    ['allowanceEffectiveFromMonth', 'allowanceEffectiveFromYear', 'allowanceStopMonth', 'allowanceStopYear'].forEach(field => {
      this.variableAllowanceForm.get(field)?.valueChanges.subscribe(() => {
        this.variableAllowanceForm.updateValueAndValidity();
      });
    });

    // Set custom filter predicate to search by label
    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      return data.label?.toLowerCase().trim().includes(filter.toLowerCase().trim());
    });
  }

  ngOnInit(): void {
    this.getVariableAllowances();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }

  ngAfterViewInit() {
    this.tableService.initializeDataSource([]);
    this.getVariableAllowances();
  }

  periodValidator(): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const isEndingPeriod = formGroup.get('isEndingPeriod')?.value;
      if (!isEndingPeriod) {
        return null;
      }

      const startMonth = formGroup.get('allowanceEffectiveFromMonth')?.value;
      const startYear = formGroup.get('allowanceEffectiveFromYear')?.value;
      const endMonth = formGroup.get('allowanceStopMonth')?.value;
      const endYear = formGroup.get('allowanceStopYear')?.value;

      if (!startMonth || !startYear || !endMonth || !endYear) {
        return null; // Handled by required validators
      }

      const monthIndex = (month: string) => {
        const index = (this as any).months.findIndex((m: string) => m.toLowerCase() === month.toLowerCase());
        return index !== -1 ? index : null;
      };

      const startMonthIndex = monthIndex(startMonth);
      const endMonthIndex = monthIndex(endMonth);

      if (startMonthIndex === null || endMonthIndex === null) {
        return null; // Invalid month values
      }

      const startDate = new Date(Number(startYear), startMonthIndex);
      const endDate = new Date(Number(endYear), endMonthIndex);

      if (endDate < startDate) {
        // You are already setting the error on the formGroup, which is correct
        // this.toast.error(this.translate.instant('payroll._variable_allowance.form.error.period_invalid_end')); // Toast is good for immediate feedback, but not for form validation display
        return { periodInvalid: true };
      }
      return null;
    };
  }

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getVariableAllowances();
  }

  getVariableAllowances() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.payroll.getVariableAllowance(pagination).subscribe(res => {
      this.tableService.setData(res.data);
      this.tableService.totalRecords = res.total;
    });
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getVariableAllowances();
      }
    });
  }

  closeModal() {
    this.variableAllowanceForm.reset({
      label: '',
      allowanceRatePerDay: 0,
      isPayrollEditable: false,
      isProvidentFundAffected: false,
      isESICAffected: false,
      isLWFAffected: false,
      isIncomeTaxAffected: false,
      deductIncomeTaxAllowance: '',
      taxRegime: [],
      paidAllowanceFrequently: '',
      allowanceEffectiveFromMonth: '',
      allowanceEffectiveFromYear: '',
      isEndingPeriod: false,
      allowanceStopMonth: '',
      allowanceStopYear: '',
      isProfessionalTaxAffected: false,
    });
    this.dialogRef.close(true);
  }

  onSubmission() {
    if (this.variableAllowanceForm.valid) {
      const formValue = this.variableAllowanceForm.value;
      if (!this.isEdit) {
        // Check for duplicate allowance before adding
        const isDuplicate = this.tableService.dataSource.data.some(
          (allowance) => allowance.label.toLowerCase() === formValue.label.toLowerCase()
        );

        if (isDuplicate) {
          this.translate.get('payroll._variable_allowance.toast.error_duplicate').subscribe(errorMessage => {
            this.toast.error(errorMessage, this.translate.instant('payroll._variable_allowance.title'));
          });
          return;
        }

        this.payroll.addVariableAllowance(formValue).subscribe({
          next: (res: any) => {
            this.tableService.setData([...this.tableService.dataSource.data, res.data]);
            this.closeModal();
            this.translate.get([
              'payroll._variable_allowance.toast.success_added',
              'payroll._variable_allowance.title'
            ]).subscribe(translations => {
              this.toast.success(
                translations['payroll._variable_allowance.toast.success_added'],
                translations['payroll._variable_allowance.title']
              );
            });
          },
          error: (err) => {
            const errorMessage = err?.error?.message || this.translate.instant('payroll._variable_allowance.toast.error_add');
            this.translate.get('payroll._variable_allowance.title').subscribe(title => {
              this.toast.error(errorMessage, title);
            });
          }
        });
      } else {
        // Check for duplicate allowance during edit, excluding the current record being edited
        const isDuplicate = this.tableService.dataSource.data.some(
          (allowance) =>
            allowance.label.toLowerCase() === formValue.label.toLowerCase() &&
            allowance._id !== this.selectedRecord._id
        );

        if (isDuplicate) {
          this.translate.get('payroll._variable_allowance.toast.error_duplicate').subscribe(errorMessage => {
            this.toast.error(errorMessage, this.translate.instant('payroll._variable_allowance.title'));
          });
          return;
        }

        this.payroll.updateVariableAllowance(this.selectedRecord._id, formValue).subscribe({
          next: (res: any) => {
            const updatedData = this.tableService.dataSource.data.map(item =>
              item._id === res.data._id ? res.data : item
            );
            this.tableService.setData(updatedData);
            this.closeModal();
            this.isEdit = false;
            this.translate.get([
              'payroll._variable_allowance.toast.success_updated',
              'payroll._variable_allowance.title'
            ]).subscribe(translations => {
              this.toast.success(
                translations['payroll._variable_allowance.toast.success_updated'],
                translations['payroll._variable_allowance.title']
              );
            });
          },
          error: (err) => {
            const errorMessage = err?.error?.message || this.translate.instant('payroll._variable_allowance.toast.error_update');
            this.translate.get('payroll._variable_allowance.title').subscribe(title => {
              this.toast.error(errorMessage, title);
            });
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.variableAllowanceForm);
      if (this.variableAllowanceForm.get('isEndingPeriod').value === true) {
        this.translate.get('payroll._variable_allowance.form.error.period_invalid_end').subscribe(errorMessage => {
          this.toast.error(errorMessage, this.translate.instant('payroll._variable_allowance.title'));
        });
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

  editRecord() {
    this.variableAllowanceForm.patchValue({
      ...this.selectedRecord,
      isPayrollEditable: !!this.selectedRecord.isPayrollEditable,
      isProvidentFundAffected: !!this.selectedRecord.isProvidentFundAffected,
      isESICAffected: !!this.selectedRecord.isESICAffected,
      isLWFAffected: !!this.selectedRecord.isLWFAffected,
      isIncomeTaxAffected: !!this.selectedRecord.isIncomeTaxAffected,
      isProfessionalTaxAffected: !!this.selectedRecord.isProfessionalTaxAffected,
      isEndingPeriod: !!this.selectedRecord.isEndingPeriod,
      allowanceEffectiveFromYear: Number(this.selectedRecord.allowanceEffectiveFromYear),
      allowanceStopYear: this.selectedRecord.allowanceStopYear ? Number(this.selectedRecord.allowanceStopYear) : ''
    });
  }

  deleteRecord(_id: string) {
    this.payroll.deleteVariableAllowance(_id).subscribe({
      next: (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.translate.get([
          'payroll._variable_allowance.toast.success_deleted',
          'payroll._variable_allowance.title'
        ]).subscribe(translations => {
          this.toast.success(
            translations['payroll._variable_allowance.toast.success_deleted'],
            translations['payroll._variable_allowance.title']
          );
        });
      },
      error: (err) => {
        const errorMessage = err?.error?.message || this.translate.instant('payroll._variable_allowance.toast.error_delete');
        this.translate.get('payroll._variable_allowance.title').subscribe(title => {
          this.toast.error(errorMessage, title);
        });
      }
    });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }
}