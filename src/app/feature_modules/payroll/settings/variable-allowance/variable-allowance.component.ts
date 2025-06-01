import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      label: ['', Validators.required],
      allowanceRatePerDay: [0],
      isPayrollEditable: [false],
      isProvidentFundAffected: [false],
      isESICAffected: [false],
      isLWFAffected: [false],
      isIncomeTaxAffected: [false],
      deductIncomeTaxAllowance: [''],
      taxRegime: [[]],
      paidAllowanceFrequently: [''],
      allowanceEffectiveFromMonth: ['', Validators.required],
      allowanceEffectiveFromYear: ['', Validators.required],
      isEndingPeriod: [false],
      allowanceStopMonth: [''],
      allowanceStopYear: [''],
      isProfessionalTaxAffected: [false],
    });

    // Set custom filter predicate to search by label
    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      return data.label.toLowerCase().includes(filter);
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