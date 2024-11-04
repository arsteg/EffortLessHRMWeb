import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-5',
  templateUrl: './step-5.component.html',
  styleUrl: './step-5.component.css'
})
export class Step5Component {
  activeTab: string = 'tabArrears';
  closeResult: string = '';
  arrearForm: FormGroup;
  changeMode: 'Add' | 'Update' = 'Add';
  @Input() selectedPayroll: any;
  selectedUserId: any;
  arrears: any;
  users: any;
  selectedRecord: any;
  payrollUser: any;

  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private commonService: CommonService,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {
    this.arrearForm = this.fb.group({
      payrollUser: [''],
      manualArrears: [0],
      arrearDays: [0],
      lopReversalDays: [0],
      salaryRevisionDays: [0],
      lopReversalArrears: [0],
      totalArrears: [0]
    })
  }

  ngOnInit() {
    this.getAllUsers();
    this.getPayrollUser();
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

  open(content: any) {
    if (this.changeMode == 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord.payrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;

        const payrollUser = this.payrollUser?.user;

        console.log(payrollUser)
        this.arrearForm.patchValue({
          payrollUser: this.getUser(payrollUser),
          manualArrears: this.selectedRecord.manualArrears,
          arrearDays: this.selectedRecord.arrearDays,
          lopReversalDays: this.selectedRecord.lopReversalDays,
          salaryRevisionDays: this.selectedRecord.salaryRevisionDays,
          lopReversalArrears: this.selectedRecord.lopReversalArrears,
          totalArrears: this.selectedRecord.totalArrears
        });
        this.arrearForm.get('payrollUser').disable();
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

  onUserSelectedFromChild(user: any) {
    this.arrearForm.patchValue({ payrollUser: user._id });
    this.selectedUserId = user;
    this.getArrears();
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

  getPayrollUser() {
    this.payrollService.getPayrollUserById(this.selectedRecord?.payrollUser).subscribe((res: any) => {
      this.payrollUser = res.data;
    })
  }
  getArrears() {
    this.payrollService.getArrear(this.selectedUserId._id).subscribe((res: any) => {
      this.arrears = res.data;
      const userRequests = this.arrears.map((item: any) => {
        return this.payrollService.getPayrollUserById(item.payrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.arrears = results;
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

  onSubmission() {
    this.arrearForm.value.payrollUser = this.selectedUserId._id;
    if (this.changeMode == 'Add') {
      this.payrollService.addArrear(this.arrearForm.value).subscribe((res: any) => {
        this.getArrears();
        this.selectedUserId = null;
        this.arrearForm.reset();
        this.toast.success('Manual Arrear Created', 'Successfully!');
      },
        err => {
          this.toast.error('Manual arrear can not be Created', 'Error!');
        })
    }
    if (this.changeMode == 'Update') {
      this.payrollService.updateArrear(this.selectedRecord._id, this.arrearForm.value).subscribe((res: any) => {
        this.getArrears();
        this.toast.success('Arrear Updated', 'Successfully');
        this.selectedUserId = null;
        this.arrearForm.reset();
        this.changeMode = 'Add';
        this.modalService.dismissAll();
      })
    }
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteArrear(_id).subscribe((res: any) => {
      this.getArrears();
      this.toast.success('Successfully Deleted!!!', 'Arrear')
    },
      (err) => {
        this.toast.error('This Arrear Can not be deleted!')
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