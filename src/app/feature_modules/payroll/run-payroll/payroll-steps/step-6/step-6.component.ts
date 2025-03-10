import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
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
  changeMode: 'Add' | 'Update' = 'Update';
  allUsers: any;
  @Input() selectedPayroll: any;
  selectedUserId: any;
  selectedRecord: any;
  payrollUsers: any;
  payrollUser: any;
  selectedPayrollUser: any;
  professionalTaxSlabs: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private userService: UserService
  ) {
    this.flexiBenefitsForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      TotalFlexiBenefitAmount: [0, Validators.required],
      TotalProfessionalTaxAmount: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.getProfessionalTaxSlabs();
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });
    this.getFlexiBenefitsByPayroll();
  }

  getProfessionalTaxSlabs(callback?: Function) {
    this.payrollService.getStateWisePTSlabs().subscribe((res: any) => {
      this.professionalTaxSlabs = res.data;
      if (callback) callback(); // Execute callback after slabs are loaded
    });
  }
  
  onUserSelectedFromChild(user: any) {
    this.selectedUserId = user.value.user;
    this.selectedPayrollUser = user.value._id;
  
    if (this.changeMode !== 'Add') {
      this.getFlexiBenefitsProfessionalTax();
    } else {
      let payload = { userId: this.selectedUserId };
  
      this.userService.getUserById(payload).subscribe((res: any) => {
        const result = res.data;
        if (result.length > 0) {
          const userState = result[0].state;
  
          // Ensure professional tax slabs are available before proceeding
          if (!this.professionalTaxSlabs) {
            this.getProfessionalTaxSlabs(() => this.processTaxSlabs(userState));
          } else {
            this.processTaxSlabs(userState);
          }
        }
      });
    }
  }
  
  processTaxSlabs(userState: string) {
    console.log("Available Professional Tax Slabs:", this.professionalTaxSlabs);
  
    // Find the matching state in professional tax slabs
    const stateSlab = this.professionalTaxSlabs?.states.find(
      (slab: any) => slab.name.toLowerCase() === userState.toLowerCase()
    );
  
    if (!stateSlab || !stateSlab.slabs) {
      console.log("No professional tax slab found for state:", userState);
      return;
    }
  
    // Fetch salary details for the user
    this.userService.getSalaryByUserId(this.selectedUserId).subscribe((res: any) => {
      const lastSalaryRecord = res.data[res.data.length - 1];
      let ctc;
  
      if (lastSalaryRecord.enteringAmount === 'Monthly') {
        ctc = lastSalaryRecord.Amount;
      } else if (lastSalaryRecord.enteringAmount === 'Yearly') {
        ctc = lastSalaryRecord.Amount / 12; // Convert yearly salary to monthly
      }
  
      console.log("User CTC (Monthly):", ctc);
  
      // Find the matching slab where CTC falls within the range
      const matchingSlab = stateSlab.slabs.find(
        (slab: any) => (ctc >= slab.fromAmount) && (ctc <= (slab.toAmount || 999999999999))
      );
  
      if (matchingSlab) {
        this.flexiBenefitsForm.patchValue({
          TotalProfessionalTaxAmount: matchingSlab.employeeAmount || 0
        });
      }
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getFlexiBenefitsProfessionalTax() {
    this.payrollService.getFlexiByUsers(this.selectedPayrollUser).subscribe((res: any) => {
      this.flexiBenefits = res.data;
      const userRequests = this.flexiBenefits.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.PayrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.flexiBenefits = userRequests
    })
  }

  getFlexiBenefitsByPayroll() {
    this.payrollService.getFlexiByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.flexiBenefits = res.data;
      const userRequests = this.flexiBenefits.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.PayrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.flexiBenefits = userRequests;
    });
  }

  onSubmission() {
    this.flexiBenefitsForm.get('PayrollUser').enable();
    this.flexiBenefitsForm.value.PayrollUser = this.selectedPayrollUser;
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
    this.flexiBenefitsForm.get('TotalProfessionalTaxAmount').disable();

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
    this.changeMode = 'Update';
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
