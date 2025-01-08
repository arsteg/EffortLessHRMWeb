import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-variable-deduction',
  templateUrl: './variable-deduction.component.html',
  styleUrl: './variable-deduction.component.css'
})
export class VariableDeductionComponent {
  closeResult: string;
  isEdit: boolean = false;
  selectedRecord: any;
  variableDeduction: any;
  variableDeductionForm: FormGroup;
  searchText: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years: number[] = [];
  members: any[];
  public sortOrder: string = '';

  constructor(private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private commonService: CommonService
  ) {
    this.variableDeductionForm = this.fb.group({
      label: ['', Validators.required],
      isShowINCTCStructure: [true, Validators.required],
      paidDeductionFrequently: ['', Validators.required],
      deductionEffectiveFromMonth: ['', Validators.required],
      deductionEffectiveFromYear: ['', Validators.required],
      isEndingPeriod: [true, Validators.required],
      deductionStopMonth: ['', Validators.required],
      deductionStopYear: ['', Validators.required],
      amountEnterForThisVariableDeduction: ['', Validators.required],
      amount: [0, Validators.required],
      percentage: [0, Validators.required],
      isAttendanceToAffectEligibility: [true, Validators.required],
      variableDeductionApplicableEmployee: [[]]
    });
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }

  ngOnInit() {
    this.getVariableDeduction();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
  }

  clearForm() {
    this.variableDeductionForm.patchValue({
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
      percentage: 0,
      isAttendanceToAffectEligibility: true,
      variableDeductionApplicableEmployee: []
    })
  }
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
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
    const formValue = this.variableDeductionForm.value;
    const payload = {
      ...formValue,
      variableDeductionApplicableEmployee: formValue.variableDeductionApplicableEmployee.map(employee => ({ employee }))
    };
    console.log(payload)
    if(this.variableDeductionForm.valid){if (!this.isEdit) {
      this.payroll.addVariableDeduction(payload).subscribe((res: any) => {
        this.variableDeduction.push(res.data);
        this.toast.success('Successfully Added!!!', 'Variable Deduction');
      },
        (err) => {
          this.toast.error('Variable Deduction Can not be added', 'Variable Deduction');
        })
    }
    else {
      this.payroll.updateVariableDeduction(this.selectedRecord._id, payload).subscribe((res: any) => {
        this.toast.success('Successfully Updated!!!', 'Variable Deduction');
        const reason = res.data;
        const index = this.variableDeduction.findIndex(reas => reas._id === reason._id);
        if (index !== -1) {
          this.variableDeduction[index] = reason;
        }
      },
        (err) => {
          this.toast.error('Variable Deduction Can not be Updated', 'Variable Deduction');
        })
    }}
    else {
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
    return value === 'Percentage of gross salary paid' || value === 'Percentage of(Basic + DA) paid (or Basic if DA is not applicable)';
  }
  editRecord() {
    this.variableDeductionForm.patchValue(this.selectedRecord)
  }

  deleteRecord(_id: string) {
    this.payroll.deleteVariableDeduction(_id).subscribe((res: any) => {
      const index = this.variableDeduction.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.variableDeduction.splice(index, 1);
        this.totalRecords--;
      }
      this.toast.success('Successfully Deleted!!!', 'Variable Deduction');
    },
      (err) => {
        this.toast.error('Variable Deduction Can not be deleted', 'Variable Deduction');
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

  onPageChange(page: number) {
    this.currentPage = page;
    this.getVariableDeduction();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getVariableDeduction();
  }

  getVariableDeduction() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getVariableDeduction(pagination).subscribe(res => {
      this.variableDeduction = res.data;
      this.totalRecords = res.total;
    })
  }
}