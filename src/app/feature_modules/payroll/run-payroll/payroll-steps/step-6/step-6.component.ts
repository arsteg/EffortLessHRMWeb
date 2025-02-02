import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-6',
  templateUrl: './step-6.component.html',
  styleUrl: './step-6.component.css'
})
export class Step6Component {
  searchText: string = '';
  flexiBenefitsForm: FormGroup;
  flexiBenefits: any;
  changeMode: 'Add' | 'Update' = 'Add';
  users: any;
  @Input() selectedPayroll: any;
  selectedUserId: any;
  selectedRecord: any;
  payrollUser: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.flexiBenefitsForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      TotalFlexiBenefitAmount: [0, Validators.required],
      TotalProfessionalTaxAmount: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.getAllUsers();
    this.getFlexiBenefitsByPayroll();
  }

  onUserSelectedFromChild(user: any) {
    this.selectedUserId = user;
    this.getFlexiBenefitsProfessionalTax();
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getFlexiBenefitsProfessionalTax() {
    this.payrollService.getFlexiByUsers(this.selectedUserId?._id).subscribe((res: any) => {
      this.flexiBenefits = res.data.records;
      const userRequests = this.flexiBenefits.map((item: any) => {
        return this.payrollService.getPayrollUserById(item.PayrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.flexiBenefits = results;
        },
        (error) => {
          this.toast.error("Error fetching payroll user details:", error);
        }
      );
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      }
    );
  }

  getFlexiBenefitsByPayroll() {
    this.payrollService.getFlexiByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.flexiBenefits = res.data;
      const userRequests = this.flexiBenefits.map((item: any) => {
        return this.payrollService.getPayrollUserById(item.PayrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.flexiBenefits = results;
        },
        (error) => {
          this.toast.error("Error fetching payroll user details:", error);
        }
      );
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      });
  }

  onSubmission() {
    this.flexiBenefitsForm.get('PayrollUser').enable();
    this.flexiBenefitsForm.value.PayrollUser = this.selectedUserId._id;
    if (this.changeMode == 'Add') {
      this.payrollService.addFlexi(this.flexiBenefitsForm.value).subscribe((res: any) => {
        this.getFlexiBenefitsProfessionalTax();
        this.toast.success('Flexi Benefits and Professional Tax Created', 'Successfully!');
        this.closeDialog();
      },
        (err) => { this.toast.error('Flexi Benefits and Professional Tax can not be Added', 'Error!'); }
      );
    }
    if (this.changeMode == 'Update') {
      this.payrollService.updateFlexi(this.selectedRecord._id, this.flexiBenefitsForm.value).subscribe((res: any) => {
        this.getFlexiBenefitsProfessionalTax();
        this.toast.success('Flexi Benefits and Professional Tax Updated', 'Successfully!');
        this.closeDialog();
      },
        err => { this.toast.error('Flexi Benefits and Professional Tax can not be Updated', 'Error!'); });
    }
  }

  openDialog() {
    if (this.changeMode == 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord.PayrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;
        const payrollUser = this.payrollUser?.user;
        this.flexiBenefitsForm.patchValue({
          PayrollUser: this.getUser(payrollUser),
          TotalFlexiBenefitAmount: this.selectedRecord?.TotalFlexiBenefitAmount,
          TotalProfessionalTaxAmount: this.selectedRecord?.TotalProfessionalTaxAmount
        });
        this.flexiBenefitsForm.get('PayrollUser').disable();
      });
    }
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteFlexi(_id).subscribe((res: any) => {
      this.getFlexiBenefitsProfessionalTax();
      this.toast.success('Successfully Deleted!!!', 'Flexi Benefits and Professional Tax');
    },
      (err) => {
        this.toast.error('This Flexi Benefits and Professional Tax Can not be deleted!');
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
