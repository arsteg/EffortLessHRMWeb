import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-fixed-allowance',
  templateUrl: './fixed-allowance.component.html',
  styleUrl: './fixed-allowance.component.css'
})
export class FixedAllowanceComponent {
  fixedAllowance: any;
  searchText: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isEdit = false;
  closeResult: string = '';
  selectedRecord: any;
  fixedAllowanceForm: FormGroup;
  public sortOrder: string = '';

  constructor(private payroll: PayrollService,
    private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.fixedAllowanceForm = this.fb.group({
      label: ['', Validators.required],
      type: ['None', Validators.required],
      isArrearsAffect: [false],
      calculatedBy: ['Monthly', Validators.required],
      isTaxEnabledOnce: [false],
      isProvidentFundAffected: [false],
      isESICAffected: [false],
      isGratuityFundAffected: [false],
      isLWFAffected: [false],
      isProfessionalTaxAffected: [false],
      isTDSAffected: [false],
      isAttendanceToEffectTheEligibility: [false
      ]
    })
  }

  ngOnInit() {
    this.getFixedAllowance();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getFixedAllowance();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getFixedAllowance();
  }

  getFixedAllowance() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getFixedAllowance(pagination).subscribe((res: any) => {
      this.fixedAllowance = res.data;
      this.totalRecords = res.total;
    });
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

  onCancel() {
    this.isEdit = false;
    this.fixedAllowanceForm.patchValue({
      label: '',
      type: 'None',
      isArrearsAffect: false,
      calculatedBy: 'Monthly',
      isTaxEnabledOnce: false,
      isProvidentFundAffected: false,
      isESICAffected: false,
      isGratuityFundAffected: false,
      isLWFAffected: false,
      isProfessionalTaxAffected: false,
      isTDSAffected: false,
      isAttendanceToEffectTheEligibility: false
    })

  }

  onSubmission() {
    if (this.fixedAllowanceForm.valid) {
      if (!this.isEdit) {
        this.payroll.addAllowanceTemplate(this.fixedAllowanceForm.value).subscribe((res: any) => {
          this.fixedAllowance.push(res.data);
          this.toast.success('Successfully Added!!!', 'Fixed Allowance');
          this.closeModal();
        },
          (err) => {
            this.toast.error('This Can not be Added as it is already used in the system', 'Fixed Allowance');
          })
      }
      else {
        this.payroll.updateAllowanceTemplate(this.selectedRecord._id, this.fixedAllowanceForm.value).subscribe((res: any) => {
          const index = this.fixedAllowance.findIndex(item => item._id === this.selectedRecord._id);
          if (index !== -1) {
            this.fixedAllowance[index] = res.data;
          }
          this.toast.success('Successfully Updated!!!', 'Fixed Allowance');
          this.closeModal();
        },
          (err) => {
            this.toast.error('This Can not be Updated as it is already used in the system', 'Fixed Allowance');
          })
      }
    }
    else {
      this.markFormGroupTouched(this.fixedAllowanceForm);
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
    this.fixedAllowanceForm.patchValue(this.selectedRecord);
  }

  clearForm() {
    this.fixedAllowanceForm.patchValue({
      label: '',
      type: 'None',
      isArrearsAffect: false,
      calculatedBy: 'Monthly',
      isTaxEnabledOnce: false,
      isProvidentFundAffected: false,
      isESICAffected: false,
      isGratuityFundAffected: false,
      isLWFAffected: false,
      isProfessionalTaxAffected: false,
      isTDSAffected: false,
      isAttendanceToEffectTheEligibility: false
    })
  }

  deleteRecord(_id: string) {
    this.payroll.deleteAllowanceTemplate(_id).subscribe((res: any) => {
      const index = this.fixedAllowance.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.fixedAllowance.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Rounding Rules');
    },
      (err) => {
        this.toast.error('This Can not be delete as it is already used in the system', 'Rounding Rules');
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
