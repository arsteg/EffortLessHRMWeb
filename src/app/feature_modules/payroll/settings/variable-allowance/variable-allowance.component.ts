import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { co } from '@fullcalendar/core/internal-common';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-variable-allowance',
  templateUrl: './variable-allowance.component.html',
  styleUrl: './variable-allowance.component.css'
})
export class VariableAllowanceComponent {
  variableAllowances: any;
  searchText: string = '';
  selectedRecord: any;
  isEdit: boolean = false;
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  variableAllowanceForm: FormGroup;
  members: any[];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years: number[] = [];
  public sortOrder: string = '';

  constructor(
    private payroll: PayrollService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private commonService: CommonService
  ) {
    this.variableAllowanceForm = this.fb.group({
      label: ['', Validators.required],
      allowanceRatePerDay: [0],
      isPayrollEditable: [false],
      isProvidentFundAffected: [false],
      isESICAffected: [false],
      isLWFAffected: [false],
      isIncomeTaxAffected: [false],
      deductIncomeTaxAllowance: ['', Validators.required],
      taxRegime: [['']],
      paidAllowanceFrequently: ['', Validators.required],
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
      } else { }
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }

  onSubmission() {
    const formValue = this.variableAllowanceForm.value;

    if (this.variableAllowanceForm.valid) {
      if (this.isEdit == false) {
        this.payroll.addVariableAllowance(formValue).subscribe((res: any) => {
          this.variableAllowances.push(res.data);
          this.variableAllowanceForm.reset({
            label: '',
            allowanceRatePerDay: 0,
            isPayrollEditable: true,
            isProvidentFundAffected: true,
            isESICAffected: true,
            isLWFAffected: true,
            isIncomeTaxAffected: true,
            deductIncomeTaxAllowance: '',
            taxRegime: '',
            paidAllowanceFrequently: '',
            allowanceEffectiveFromMonth: '',
            allowanceEffectiveFromYear: '',
            isEndingPeriod: true,
            allowanceStopMonth: '',
            allowanceStopYear: '',
            isProfessionalTaxAffected: true,
          });
          this.toast.success('Successfully Added!!!', 'Variable Allowance');
        },
          (err) => {
            this.toast.error('Variable Allowance Can not be Added', 'Variable Allowance');
          });
      } else {
        this.payroll.updateVariableAllowance(this.selectedRecord._id, formValue).subscribe((res: any) => {
          this.getVariableAllowances();
          this.variableAllowanceForm.reset({
            label: '',
            allowanceRatePerDay: 0,
            isPayrollEditable: true,
            isProvidentFundAffected: true,
            isESICAffected: true,
            isLWFAffected: true,
            isIncomeTaxAffected: true,
            deductIncomeTaxAllowance: '',
            taxRegime: '',
            isShowInCTCStructure: true,
            paidAllowanceFrequently: '',
            allowanceEffectiveFromMonth: '',
            allowanceEffectiveFromYear: '',
            isEndingPeriod: true,
            allowanceStopMonth: '',
            allowanceStopYear: '',
            amountEnterForThisVariableAllowance: '',
            amount: 0,
            percentage: 0,
            isProfessionalTaxAffected: true,
            isAttandanceToAffectEligibility: true,
            variableAllowanceApplicableEmployee: []
          });
          this.isEdit = false;
          this.toast.success('Successfully Updated!!!', 'Variable Allowance');
        },
          (err) => {
            this.toast.error('Variable Allowance Can not be Updated', 'Variable Allowance');
          });
      }
    } else {
      this.variableAllowanceForm.markAllAsTouched();
    }
  }

  editRecord() {
    this.variableAllowanceForm.patchValue({
      ...this.selectedRecord,
      isPayrollEditable: this.selectedRecord.isPayrollEditable ? true : false,
      isProvidentFundAffected: this.selectedRecord.isProvidentFundAffected ? true : false,
      isESICAffected: this.selectedRecord.isESICAffected ? true : false,
      isLWFAffected: this.selectedRecord.isLWFAffected ? true : false,
      isIncomeTaxAffected: this.selectedRecord.isIncomeTaxAffected ? true : false,
      isProfessionalTaxAffected: this.selectedRecord.isProfessionalTaxAffected ? true : false,
      isEndingPeriod: this.selectedRecord.isEndingPeriod ? true : false,
      allowanceEffectiveFromYear: Number(this.selectedRecord.allowanceEffectiveFromYear),
      allowanceStopYear: Number(this.selectedRecord.allowanceStopYear)
    });
  }

  deleteRecord(_id: string) {
    this.payroll.deleteVariableAllowance(_id).subscribe((res: any) => {
      this.getVariableAllowances();
      this.toast.success('Successfully Deleted!!!', 'Variable Allowance');
    },
      (err) => {
        this.toast.error('Variable Allowance Can not be deleted', 'Variable Allowance');
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