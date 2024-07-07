import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-variable-allowance',
  templateUrl: './variable-allowance.component.html',
  styleUrl: './variable-allowance.component.css'
})
export class VariableAllowanceComponent {
  variableAllowances: any;
  VariableAllowanceForm: FormGroup;
  searchText: string = '';
  selectedRecord: any;
  isEdit: boolean = false;
  closeResult: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  variableAllwances: any;
  variableAllwancesForm: FormGroup;

  constructor(private payroll: PayrollService,
    private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog) {
    this.VariableAllowanceForm = this.fb.group({
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
      this.variableAllwances = res.data;
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
    if (!this.isEdit) {
      this.payroll.addVariableAllowance(this.variableAllwancesForm.value).subscribe((res: any) => {
        this.variableAllwances.push(res.data);
        this.toast.success('Successfully Added!!!', 'Variable Allwance');
        this.clearForm();
      },
        (err) => {
          this.toast.error('Variable Allwance Can not be Added', 'Variable Allwance');
        })
    }
    else {
      this.payroll.updateVariableAllowance(this.selectedRecord._id, this.variableAllwancesForm.value).subscribe((res: any) => {
        const index = this.variableAllwances.findIndex(item => item._id === this.selectedRecord._id);
        if (index !== -1) {
          this.variableAllwances[index] = res.data;
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
    this.variableAllwancesForm.patchValue(this.selectedRecord);
  }

  clearForm() {
    this.variableAllwancesForm.patchValue({
      fromAmount: 0,
      toAmount: 0,
      employeePercentage: 0,
      employerPercentage: 0,
    })
  }

  deleteRecord(_id: string) {
    this.payroll.deleteVariableAllowance(_id).subscribe((res: any) => {
      const index = this.variableAllwances.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.variableAllwances.splice(index, 1);
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