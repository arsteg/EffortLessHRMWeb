import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  dialogRef: MatDialogRef<any>;

  constructor(private payroll: PayrollService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.fixedAllowanceForm = this.fb.group({
      label: ['', Validators.required],
      isProvidentFundAffected: [false],
      isESICAffected: [false],
      isGratuityFundAffected: [false],
      isLWFAffected: [false],
      isProfessionalTaxAffected: [false],
      isTDSAffected: [false],
    })
  }

  ngOnInit() {
    this.getFixedAllowance();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
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
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true,
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getFixedAllowance();
      }
    });
  }

  closeModal() {
    this.dialogRef.close(true);
  }

  onSubmission() {
    if (this.fixedAllowanceForm.valid) {
      if (!this.isEdit) {
        this.payroll.addAllowanceTemplate(this.fixedAllowanceForm.value).subscribe((res: any) => {
          this.toast.success('Successfully Added!!!', 'Fixed Allowance');
          this.closeModal();
        },
          (err) => {
            this.toast.error('This Can not be Added as it is already used in the system', 'Fixed Allowance');
          })
      }
      else {
        this.payroll.updateAllowanceTemplate(this.selectedRecord._id, this.fixedAllowanceForm.value).subscribe((res: any) => {
          this.toast.success('Successfully Updated!!!', 'Fixed Allowance');
          this.closeModal();
        },
          (err) => {
            this.toast.error('This Can not be Updated as it is already used in the system', 'Fixed Allowance');
          })
      }
      this.fixedAllowanceForm.get('label').enable();
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
    this.fixedAllowanceForm.patchValue({
      label: this.selectedRecord.label,
      isProvidentFundAffected: this.selectedRecord.isProvidentFundAffected,
      isESICAffected: this.selectedRecord.isESICAffected,
      isGratuityFundAffected: this.selectedRecord.isGratuityFundAffected,
      isLWFAffected: this.selectedRecord.isLWFAffected,
      isProfessionalTaxAffected: this.selectedRecord.isProfessionalTaxAffected,
      isTDSAffected: this.selectedRecord.isTDSAffected,
    });
    if(this.selectedRecord.isDelete===false)
    {
    this.fixedAllowanceForm.get('label').disable();
    }
    else{
      this.fixedAllowanceForm.get('label').enable();
    }
    console.log(this.selectedRecord);
    console.log(this.fixedAllowanceForm.value);
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
