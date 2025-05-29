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
  selector: 'app-variable-deduction',
  templateUrl: './variable-deduction.component.html',
  styleUrls: ['./variable-deduction.component.css']
})
export class VariableDeductionComponent implements OnInit, AfterViewInit {
  isEdit: boolean = false;
  selectedRecord: any;
  variableDeductionForm: FormGroup;
  dialogRef: MatDialogRef<any>;
  months: string[] = [];
  years: number[] = [];
  members: any[];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private commonService: CommonService,
    private translate: TranslateService,
    public tableService: TableService<any>
  ) {
    this.variableDeductionForm = this.fb.group({
      label: ['', Validators.required],
      isShowINCTCStructure: [true, Validators.required],
      paidDeductionFrequently: ['', Validators.required],
      deductionEffectiveFromMonth: ['', Validators.required],
      deductionEffectiveFromYear: ['', Validators.required],
      isEndingPeriod: [true, Validators.required],
      deductionStopMonth: [''],
      deductionStopYear: [''],
      amountEnterForThisVariableDeduction: ['', Validators.required],
      amount: [0],
      percentage: [0]
    });

    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      this.years.push(year);
    }

    // Set custom filter predicate to search by label
    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      return data.label.toLowerCase().includes(filter);
    });
  }

  ngOnInit() {
    // Load translated months
    this.months = this.translate.instant('payroll.months');
    this.getVariableDeduction();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
  }

  ngAfterViewInit() {
    this.tableService.initializeDataSource([]);
    this.getVariableDeduction();
  }

  clearForm() {
    this.variableDeductionForm.reset({
      label: '',
      isShowINCTCStructure: true,
      paidDeductionFrequently: '',
      deductionEffectiveFromMonth: '',
      deductionEffectiveFromYear: '',
      isEndingPeriod: true,
      deductionStopMonth: '',
      deductionStopYear: '',
      amountEnterForThisVariableDeduction: '',
      amount: 0,
      percentage: 0
    });
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getVariableDeduction();
      }
    });
  }

  closeModal() {
    this.clearForm();
    this.dialogRef.close(true);
  }

  onSubmission() {
    if (this.variableDeductionForm.valid) {
      const formValue = this.variableDeductionForm.value;
      const payload = { ...formValue };
      if (!this.isEdit) {
        this.payroll.addVariableDeduction(payload).subscribe({
          next: (res: any) => {
            this.tableService.setData([...this.tableService.dataSource.data, res.data]);
            this.closeModal();
            this.toast.success(
              this.translate.instant('payroll.variable_deduction.toast.success_added'),
              this.translate.instant('payroll.variable_deduction.toast.title')
            );
          },
          error: (err) => {
            this.toast.error(
              this.translate.instant('payroll.variable_deduction.toast.error_add'),
              this.translate.instant('payroll.variable_deduction.toast.title')
            );
          }
        });
      } else {
        this.payroll.updateVariableDeduction(this.selectedRecord._id, payload).subscribe({
          next: (res: any) => {
            const updatedData = this.tableService.dataSource.data.map(item =>
              item._id === res.data._id ? res.data : item
            );
            this.tableService.setData(updatedData);
            this.closeModal();
            this.toast.success(
              this.translate.instant('payroll.variable_deduction.toast.success_updated'),
              this.translate.instant('payroll.variable_deduction.toast.title')
            );
          },
          error: (err) => {
            this.toast.error(
              this.translate.instant('payroll.variable_deduction.toast.error_update'),
              this.translate.instant('payroll.variable_deduction.toast.title')
            );
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.variableDeductionForm);
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

  isPercentageSelected(): boolean {
    const value = this.variableDeductionForm.get('amountEnterForThisVariableDeduction').value;
    return (
      value === this.translate.instant('payroll.variable_deduction.amount_percentage_gross') ||
      value === this.translate.instant('payroll.variable_deduction.amount_percentage_basic_da')
    );
  }

  editRecord() {
    this.variableDeductionForm.patchValue(this.selectedRecord);
  }

  deleteRecord(_id: string) {
    this.payroll.deleteVariableDeduction(_id).subscribe({
      next: (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(
          this.translate.instant('payroll.variable_deduction.toast.success_deleted'),
          this.translate.instant('payroll.variable_deduction.toast.title')
        );
      },
      error: (err) => {
        this.toast.error(
          this.translate.instant('payroll.variable_deduction.toast.error_delete'),
          this.translate.instant('payroll.variable_deduction.toast.title')
        );
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

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getVariableDeduction();
  }

  getVariableDeduction() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.payroll.getVariableDeduction(pagination).subscribe(res => {
      this.tableService.setData(res.data);
      this.tableService.totalRecords = res.total;
    });
  }
}