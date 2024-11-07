import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-4',
  templateUrl: './step-4.component.html',
  styleUrl: './step-4.component.css'
})
export class Step4Component {
  searchText: string = '';
  closeResult: string = '';
  loanAdvanceForm: FormGroup;
  selectedUserId: any;
  loanAdvances: any;
  userloanAdvances: any;
  allLoanAdvances: any;
  users: any;
  @Input() selectedPayroll: any;
  changeMode: 'Add' | 'Update' = 'Add';
  selectedRecord: any;
  payrollUser: any;
  matchedLoanAdvances: any;

  constructor(private modalService: NgbModal,
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private userService: UserService,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {
    this.loanAdvanceForm = this.fb.group({
      payrollUser: [''],
      loanAndAdvance: [''],
      disbursementAmount: [0],
      status: ['Pending']
    })
  }

  ngOnInit() {
    this.getAllUsers();
    this.getAllLoansAdvances();
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  clearForm() {
    this.loanAdvanceForm.patchValue({
      payrollUser: '',
      loanAndAdvance: '',
      disbursementAmount: 0,
      status: 'Pending'
    })
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

  onUserSelectedFromChild(userId: any) {
    this.selectedUserId = userId;
    this.getLoanAdvances();
    if (this.changeMode === 'Add' || this.changeMode === 'Update') {
      this.getAllLoansAdvances();
      this.getLoanAdvancesOfUser();
    }
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

  getLoanAdvancesOfUser() {
    this.userService.getLoansAdvancesByUserId(this.selectedUserId?.user, { skip: '', next: '' }).subscribe((res: any) => {
      this.userloanAdvances = res.data;

      if (this.userloanAdvances.length > 0) {
        this.userloanAdvances.unshift({ loanAdvancesCategory: '', name: 'Select Loan/Advance' });
      } else {
        this.userloanAdvances.unshift({ loanAdvancesCategory: '', name: 'Loans/Advances not Assigned to the Selected User' });
      }
    })
  }

  getAllLoansAdvances() {
    this.payrollService.getLoans({ skip: '', next: '' }).subscribe((res: any) => {
      this.allLoanAdvances = res.data;
    })
  }

  getMatchingCategory(loanAdvance: string) {
    const matchingCategory = this.allLoanAdvances?.find(record => record?._id === loanAdvance);
    return matchingCategory ? `${matchingCategory.name}` : 'N/A';
  }

  setFormValues(form: any) {
    this.payrollService.getPayrollUserById(this.selectedRecord.payrollUser).subscribe((res: any) => {
      this.payrollUser = res.data;
      const payrollUser = this.payrollUser?.user;
      this.loanAdvanceForm.patchValue({
        payrollUser: this.getUser(payrollUser),
        loanAndAdvance: form.loanAndAdvance,
        disbursementAmount: form.disbursementAmount,
        status: form.status
      });
      this.loanAdvanceForm.get('payrollUser').disable();
    })
  }

 
  onSubmission() {
    this.loanAdvanceForm.value.payrollUser = this.selectedUserId?._id;
    
    if (this.changeMode === 'Add') {
      this.payrollService.addLoanAdvance(this.loanAdvanceForm.value).subscribe(
        (res: any) => {
          this.getLoanAdvances();
          this.toast.success('Loan/Advance created', 'Successfully!');
        },
        (err) => {
          this.toast.error('Loan/Advance cannot be created', 'Error!');
        }
      );
    }
  
    if (this.changeMode === 'Update') {
      this.payrollService.updateLoanAdvance(this.selectedRecord._id, this.loanAdvanceForm.value).subscribe(
        (res: any) => {
          this.getLoanAdvances();
          this.toast.success('Loan/Advance Updated', 'Successfully');
          this.loanAdvanceForm.reset();
          this.selectedUserId = null;
          this.userloanAdvances = null;
          this.changeMode = 'Add';
        },
        (err) => {
          this.toast.error('Loan/Advance cannot be Updated', 'Error');
        }
      );
    }
  }
  
  getLoanAdvances() {
    forkJoin({
      userLoanAdvances: this.userService.getLoansAdvancesByUserId(this.selectedUserId?.user, { skip: '', next: '' }),
      loanAdvances: this.payrollService.getLoanAdvance(this.selectedUserId?._id)
    }).pipe(
      switchMap(({ userLoanAdvances, loanAdvances }) => {
        this.userloanAdvances = userLoanAdvances.data;
        this.loanAdvances = loanAdvances.data;
  
        const userRequests = this.loanAdvances.map((item: any) =>
          this.payrollService.getPayrollUserById(item.payrollUser).pipe(
            map((userRes: any) => ({
              ...item,
              payrollUserDetails: this.getUser(userRes?.data.user)
            }))
          )
        );
  
        return forkJoin(userRequests);
      })
    ).subscribe(
      (detailedLoanAdvances) => {
        this.loanAdvances = detailedLoanAdvances;
  
        this.matchedLoanAdvances = this.loanAdvances.reduce((acc: any[], loanAdvance) => {
          const matchingUserLoanAdvance = this.userloanAdvances.find(
            (userLoanAdvance) => userLoanAdvance.loanAdvancesCategory === loanAdvance.loanAndAdvance
          );
  
          if (matchingUserLoanAdvance) {
            acc.push({
              ...loanAdvance,
              amount: matchingUserLoanAdvance.amount,
              frequency: matchingUserLoanAdvance.repaymentFrequency
            });
          }
  
          return acc;
        }, []);
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }  
  
  deleteTemplate(_id: string) {
    this.payrollService.deleteLoanAdvance(_id).subscribe((res: any) => {
      this.getLoanAdvances();
      if (res != null) {
        const index = this.matchedLoanAdvances.findIndex(temp => temp._id === _id);
        if (index !== -1) {
          this.matchedLoanAdvances.splice(index, 1);
        }
      }
      this.toast.success('Successfully Deleted!!!', 'Loan/Advance')
    },
      (err) => {
        this.toast.error('This Loan/Advance Can not be deleted!')
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
