import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

const labelValidator: ValidatorFn = (control: AbstractControl) => {
  const value = control.value as string;
  // Check if the value is empty or only whitespace
  if (!value || /^\s*$/.test(value)) {
    return { required: true }; // Treat empty or only whitespace as required error
  }
  // Ensure at least one letter and only allowed characters (letters, spaces, (), /)
  const valid = /^(?=.*[a-zA-Z])[a-zA-Z\s(),/]*$/.test(value);
  return valid ? null : { invalidLabel: true };
};
const periodValidator: ValidatorFn = (formGroup: FormGroup) => {
  const isEndingPeriod = formGroup.get('isEndingPeriod')?.value;
  if (!isEndingPeriod) {
    return null; // No validation needed if there's no end period
  }

  const startMonth = formGroup.get('allowanceEffectiveFromMonth')?.value;
  const startYear = formGroup.get('allowanceEffectiveFromYear')?.value;
  const endMonth = formGroup.get('allowanceStopMonth')?.value;
  const endYear = formGroup.get('allowanceStopYear')?.value;

  if (!startMonth || !startYear || !endMonth || !endYear) {
    return null;
  }

  const monthMap: { [key: string]: number } = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
  };

  const startMonthNum = monthMap[startMonth.toLowerCase()];
  const endMonthNum = monthMap[endMonth.toLowerCase()];
  if (!startMonthNum || !endMonthNum) {
    return { invalidMonth: true };
  }

  const startDate = new Date(Number(startYear), startMonthNum - 1);
  const endDate = new Date(Number(endYear), endMonthNum - 1);

  return endDate > startDate ? null : { invalidPeriod: true };
};

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
  months: string[] = [];
  years: number[] = [];
  dialogRef: MatDialogRef<any>;
  columns: TableColumn[] = [
    { key: 'label', name: this.translate.instant('payroll._variable_allowance.table.allowance_name') },
    {
      key: 'isProvidentFundAffected', name: this.translate.instant('payroll._variable_allowance.table.pf'), icons: [
        {
          name: 'check',
          value: true,
          class: 'text-success'
        },
        {
          name: 'close',
          value: false,
          class: 'text-danger'
        }
      ]
    },
    {
      key: 'isESICAffected', name: this.translate.instant('payroll._variable_allowance.table.esic'), icons: [
        {
          name: 'check',
          value: true,
          class: 'text-success'
        },
        {
          name: 'close',
          value: false,
          class: 'text-danger'
        }
      ]
    },
    {
      key: 'isLWFAffected', name: this.translate.instant('payroll._variable_allowance.table.lwf'), icons: [
        {
          name: 'check',
          value: true,
          class: 'text-success'
        },
        {
          name: 'close',
          value: false,
          class: 'text-danger'
        }
      ]
    },
    {
      key: 'isProfessionalTaxAffected', name: this.translate.instant('payroll._variable_allowance.table.pt'), icons: [
        {
          name: 'check',
          value: true,
          class: 'text-success'
        },
        {
          name: 'close',
          value: false,
          class: 'text-danger'
        }
      ]
    },
    {
      key: 'isIncomeTaxAffected', name: this.translate.instant('payroll._variable_allowance.table.it'), icons: [
        {
          name: 'check',
          value: true,
          class: 'text-success'
        },
        {
          name: 'close',
          value: false,
          class: 'text-danger'
        }
      ]
    },
    { key: 'paidAllowanceFrequently', name: this.translate.instant('payroll._variable_allowance.table.frequency') },
    {
      key: 'action',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: "delete-btn" },
      ]
    },
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  allowances = []
  allData = []

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
      label: ['', [Validators.required, labelValidator]],
      allowanceRatePerDay: [0, [Validators.required, Validators.min(0)]],
      isShowINCTCStructure:[false],
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
    }, { validators: periodValidator });

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
    this.translate.get('payroll._lwf.monthly_deduction.month').subscribe((translations) => {
      this.months = Object.values(translations);
    });
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

  onSearch(search: any) {
    const data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    });
    this.tableService.setData(data);
  }


   onAction(event: any, modal: any) {
    switch (event.action.label) {
      case 'Edit':
        this.selectedRecord = event.row;
        this.open(modal);
        this.isEdit = true;
        this.editRecord();
        break;
      case 'Delete': this.deleteDialog(event.row?._id); break;
    }
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
      this.allData = res.data;
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
      isShowINCTCStructure:false,
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
      if (this.variableAllowanceForm.hasError('invalidPeriod')) {
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
      isShowINCTCStructure: !!this.selectedRecord.isShowINCTCStructure,
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