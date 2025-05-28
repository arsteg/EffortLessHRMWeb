import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-variable-allowance',
  templateUrl: './variable-allowance.component.html',
  styleUrls: ['./variable-allowance.component.css']
})
export class VariableAllowanceComponent implements OnInit {
  variableAllowances: any;
  searchText: string = '';
  selectedRecord: any;
  isEdit: boolean = false;
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  variableAllowanceForm: FormGroup;
  members: any[];
  // Use lowercase month names to match translation keys
  months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  years: number[] = [];
  public sortOrder: string = '';

  constructor(
    private payroll: PayrollService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private commonService: CommonService,
    private translate: TranslateService // Inject TranslateService
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

  onPageChange(page: number) {
    this.currentPage = page;
    this.getVariableAllowances();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getVariableAllowances();
  }

  getVariableAllowances() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getVariableAllowance(pagination).subscribe(res => {
      this.variableAllowances = res.data;
      this.totalRecords = res.total;
    });
  }

  open(content: any) {
    const dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'save') {
        this.onSubmission();
      }
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }

  onSubmission() {
    const formValue = this.variableAllowanceForm.value;

    if (this.variableAllowanceForm.valid) {
      if (!this.isEdit) {
        this.payroll.addVariableAllowance(formValue).subscribe(
          (res: any) => {
            this.variableAllowances.push(res.data);
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
          (err) => {
            const errorMessage = err?.error?.message || this.translate.instant('payroll._variable_allowance.toast.error_add');
            this.translate.get('payroll._variable_allowance.title').subscribe(title => {
              this.toast.error(errorMessage, title);
            });
          }
        );
      } else {
        this.payroll.updateVariableAllowance(this.selectedRecord._id, formValue).subscribe(
          (res: any) => {
            this.getVariableAllowances();
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
          (err) => {
            const errorMessage = err?.error?.message || this.translate.instant('payroll._variable_allowance.toast.error_update');
            this.translate.get('payroll._variable_allowance.title').subscribe(title => {
              this.toast.error(errorMessage, title);
            });
          }
        );
      }
    } else {
      this.variableAllowanceForm.markAllAsTouched();
    }
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
    this.payroll.deleteVariableAllowance(_id).subscribe(
      (res: any) => {
        this.getVariableAllowances();
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
      (err) => {
        const errorMessage = err?.error?.message || this.translate.instant('payroll._variable_allowance.toast.error_delete');
        this.translate.get('payroll._variable_allowance.title').subscribe(title => {
          this.toast.error(errorMessage, title);
        });
      }
    );
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