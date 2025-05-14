import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-step-8',
  templateUrl: './step-8.component.html',
  styleUrls: ['./step-8.component.css']
})
export class Step8Component {
  searchText: string = '';
  closeResult: string = '';
  taxForm: FormGroup;
  allUsers: any;
  changeMode: 'Add' | 'Update' = 'Update';
  incomeTax: any;
  selectedUserId: any;
  @Input() selectedPayroll: any;
  selectedRecord: any;
  payrollUser: any;
  payrollUsers: any;
  selectedPayrollUser: any;
  statutoryDetails: any;
  taxableSalary: number = 0;
  taxPayableOldRegime: number = 0;
  taxPayableNewRegime: number = 0;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  totalTaxApprovedAmount = 0;
  ctc: number = 0;
  taxCalulationMethod: boolean = false;
  isIncomeTaxDeductionFalse: boolean = false;

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private userService: UserService,
    private taxService: TaxationService
  ) {
    this.taxForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      TaxCalculatedMethod: ['', Validators.required],
      TaxCalculated: [0, Validators.required],
      TDSCalculated: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });
    this.getIncomeTaxByPayroll();
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  onSubmission() {
    this.taxForm.get('TaxCalculatedMethod').enable();
    this.taxForm.get('TaxCalculated')?.enable();
    this.taxForm.get('TDSCalculated')?.enable();
    
    this.taxForm.value.PayrollUser = this.selectedPayrollUser;
    let payload = {
      PayrollUser: this.selectedPayrollUser,
      TaxCalculatedMethod: this.taxForm.value.TaxCalculatedMethod,  
      TaxCalculated: this.taxForm.value.TaxCalculated,
      TDSCalculated: this.taxForm.value.TDSCalculated
    }
    this.payrollService.addIncomeTax(payload).subscribe((res: any) => {
      this.getIncomeTaxByPayroll();
      this.taxForm.reset();
      this.toast.success('Payroll Income Tax Added', 'Successfully!');
      this.closeDialog();
    }, err => {
      this.toast.error('Payroll Income Tax Can not be Added', 'Error!');
    });
  }

  onUserSelectedFromChild(user: any) {
    this.selectedUserId = user.value.user;
    this.selectedPayrollUser = user.value._id;
    if (this.changeMode === 'Add') {
     
      this.userService.CalculateTDSAmountByUserId(this.selectedUserId).subscribe((res: any) => {
        this.taxForm.patchValue({        
          TaxCalculatedMethod: res.data.regime,
          TaxCalculated: res.data.contributionData,
          TDSCalculated: parseFloat((res.data.contributionData / 12).toFixed(0))
        }); 
      }, err => {
        this.toast.error('Payroll Income Tax Can not be Added', 'Error!');
      });
    }
    if (this.changeMode === 'Update') {
      this.getIncomeTax();
    }
  }

  getIncomeTax() {
    this.payrollService.getIncomeTax(this.selectedPayrollUser).subscribe((res: any) => {
      this.incomeTax = res.data;
      const userRequests = this.incomeTax.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.PayrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.incomeTax = userRequests;
    });
  }

  getIncomeTaxByPayroll() {
    this.payrollService.getIncomeTaxByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.incomeTax = res.data;
      const userRequests = this.incomeTax.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.PayrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.incomeTax = userRequests;
    });
  }

  openDialog() {
    if (this.changeMode === 'Update') {    
      this.payrollService.getPayrollUserById(this.selectedRecord?.PayrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;
        const payrollUser = this.payrollUser?.user;
        this.taxForm.patchValue({
          PayrollUser: this.getUser(payrollUser),
          TaxCalculatedMethod: this.selectedRecord?.TaxCalculatedMethod,
          TaxCalculated: this.selectedRecord?.TaxCalculated,
          TDSCalculated: this.selectedRecord?.TDSCalculated
        });
        this.taxForm.get('PayrollUser').disable();
      });
    }
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.changeMode = 'Update';
    this.taxCalulationMethod = false;
    this.dialog.closeAll();
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteIncomeTax(_id).subscribe((res: any) => {
      this.getIncomeTaxByPayroll();
      this.toast.success('Successfully Deleted!!!', 'Income-Tax Overwrite');
    }, err => {
      this.toast.error('This Income-Tax Overwrite Can not be deleted!');
    });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }


}