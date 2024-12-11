import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-8',
  templateUrl: './step-8.component.html',
  styleUrl: './step-8.component.css'
})
export class Step8Component {
  searchText: string = '';
  closeResult: string = '';
  taxForm: FormGroup;
  users: any;
  changeMode: 'Add' | 'Update' = 'Add';
  incomeTax: any;
  selectedUserId: any;
  @Input() selectedPayroll: any;
  selectedRecord: any;
  payrollUser: any;

  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    private commonService: CommonService,
    private payrollService: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.taxForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      TaxCalculatedMethod: ['', Validators.required],
      TaxCalculated: [0, Validators.required],
      TDSCalculated: [0, Validators.required]
    })
  }

  ngOnInit() {
    this.getAllUsers();
    this.getIncomeTaxByPayroll();
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  onSubmission() {
    this.taxForm.value.PayrollUser = this.selectedUserId?._id;
    if (this.changeMode == 'Add') {
      this.payrollService.addIncomeTax(this.taxForm.value).subscribe((res: any) => {
        this.getIncomeTax();
        this.taxForm.reset();
        this.toast.success('Income Tax Added', 'Successfully!');
        this.modalService.dismissAll();
      },
        err => {
          this.toast.error('Income Tax Can not be Added', 'Error!')
        })
    }
    if (this.changeMode == 'Update') {
      this.payrollService.updateIncomeTax(this.selectedRecord._id, this.taxForm.value).subscribe((res: any) => {
        this.getIncomeTax();
        this.taxForm.reset();
        this.changeMode = 'Add';
        this.toast.success('Income Tax Updated', 'Successfully!');
        this.modalService.dismissAll();
      },
        err => {
          this.toast.error('Income Tax Can not be Updated', 'Error!')
        })
    }
  }

  onUserSelectedFromChild(user: any) {
    this.selectedUserId = user;
    this.getIncomeTax();
  }

  getIncomeTax() {
    this.payrollService.getIncomeTax(this.selectedUserId?._id).subscribe((res: any) => {
      this.incomeTax = res.data;
      const userRequests = this.incomeTax.map((item: any) => {
        return this.payrollService.getPayrollUserById(item.PayrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.incomeTax = results;
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

  getIncomeTaxByPayroll() {
    this.payrollService.getIncomeTaxByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.incomeTax = res.data;
      const userRequests = this.incomeTax.map((item: any) => {
        return this.payrollService.getPayrollUserById(item.PayrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.incomeTax = results;
        },
        (error) => {
          this.toast.error("Error fetching payroll user details:", error);
        }
      );
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      })
  }

  open(content: any) {
    if (this.changeMode == 'Update') {
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
      })
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
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

  deleteTemplate(_id: string) {
    this.payrollService.deleteIncomeTax(_id).subscribe((res: any) => {
      this.getIncomeTax();
      this.toast.success('Successfully Deleted!!!', 'Income-Tax Overwrite')
    },
      (err) => {
        this.toast.error('This Income-Tax Overwrite Can not be deleted!')
      })
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
