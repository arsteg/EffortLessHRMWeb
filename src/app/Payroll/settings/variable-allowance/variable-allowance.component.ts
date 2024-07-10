import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  closeResult: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  variableAllowanceForm: FormGroup;
  members: any[];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years: number[] = [];

  constructor(private payroll: PayrollService,
    private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private commonService: CommonService) {
    this.variableAllowanceForm = this.fb.group({
      label: ['', Validators.required],
      allowanceRatePerDay: [0, Validators.required],
      isPayrollEditable: [true, Validators.required],
      isProvidentFundAffected: [true, Validators.required],
      isESICAffected: [true, Validators.required],
      isLWFAffected: [true, Validators.required],
      isIncomeTaxAffected: [true, Validators.required],
      deductIncomeTaxAllowance: ['', Validators.required],
      taxRegime: ['', Validators.required],
      isShowInCTCStructure: [true, Validators.required],
      paidAllowanceFrequently: ['', Validators.required],
      allowanceEffectiveFromMonth: ['', Validators.required],
      allowanceEffectiveFromYear: ['', Validators.required],
      isEndingPeriod: [true, Validators.required],
      allowanceStopMonth: ['', Validators.required],
      allowanceStopYear: ['', Validators.required],
      amountEnterForThisVariableAllowance: ['', Validators.required],
      amount: [0, Validators.required],
      percentage: [0, Validators.required],
      isAttandanceToAffectEligibility: [true, Validators.required],
      variableAllowanceApplicableEmployee: [
        {
          employee: ['', Validators.required],
        }
      ]
    });
  }

  ngOnInit(): void {
    this.getVariableAllowances();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
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
    })
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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
  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    const formValue = this.variableAllowanceForm.value;
    formValue.variableAllowanceApplicableEmployee = formValue.variableAllowanceApplicableEmployee.map(item => ({
      employee: item
    }));
    console.log(formValue);
    if (!this.isEdit) {
      this.payroll.addVariableAllowance(formValue).subscribe((res: any) => {
        this.variableAllowances.push(res.data);
        this.toast.success('Successfully Added!!!', 'Variable Allwance');
        this.clearForm();
      },
        (err) => {
          this.toast.error('Variable Allwance Can not be Added', 'Variable Allwance');
        })
    }
    else {
      this.payroll.updateVariableAllowance(this.selectedRecord._id, formValue).subscribe((res: any) => {
        const index = this.variableAllowances.findIndex(item => item._id === this.selectedRecord._id);
        if (index !== -1) {
          this.variableAllowances[index] = res.data;
        }
        this.toast.success('Successfully Updated!!!', 'Variable Allwance');
        this.clearForm();
      },
        (err) => {
          this.toast.error('Variable Allwance Can not be Updated', 'Variable Allwance');
        })
    }
  }

  editRecord() {
    this.variableAllowanceForm.patchValue(this.selectedRecord);
  }

  clearForm() {
    this.variableAllowanceForm.patchValue({
      fromAmount: 0,
      toAmount: 0,
      employeePercentage: 0,
      employerPercentage: 0,
    })
  }

  deleteRecord(_id: string) {
    this.payroll.deleteVariableAllowance(_id).subscribe((res: any) => {
      const index = this.variableAllowances.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.variableAllowances.splice(index, 1);
        this.totalRecords--; 
      }
      this.toast.success('Successfully Deleted!!!', 'Variable Allwance');
    },
      (err) => {
        this.toast.error('Variable Allwance Can not be deleted', 'Variable Allwance');
      })
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