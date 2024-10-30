import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-step-1',
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.css'
})
export class Step1Component {
  activeTab: string = 'tabActiveEmployees';
  closeResult: string = '';
  @Input() selectedPayroll: any;
  payrollUsers: any;
  users: any;
  payrollUserForm: FormGroup;
  selectedRecord: any;
  activeUsers: any[] = [];
  onHoldUsers: any[] = [];
  processedUsers: any[] = [];
  status : 'Active' | 'OnHold' | 'Processed' = 'Active';
  

  constructor(private modalService: NgbModal,
    private payrollService: PayrollService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.payrollUserForm = this.fb.group({
      payroll: [''],
      user: [''],
      totalHomeTake: [0],
      totalFlexiBenefits: [0],
      totalCTC: [0],
      totalGrossSalary: [0],
      totalTakeHome: [0],
      status: [''],
      totalFixedAllowance: [0],
      totalOtherBenefits: [0],
      totalEmployeeStatutoryDeduction: [0],
      totalEmployeeStatutoryContribution: [0],
      totalFixedDeduction: [0],
      totalVariableDeduction: [0],
      totalLoan: [0],
      totalAdvance: [0]
    })
  }

  ngOnInit() {
    this.getAllUsers();
    this.getPayrollById();
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

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

  open(content: any) {
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

 
  getPayrollById() {
    const payload = { skip: '', next: '', payroll: this.selectedPayroll._id };
  
    this.payrollService.getPayrollUsers(payload).subscribe((res: any) => {
      this.payrollUsers = res.data;
  
      // Filter records for each status
      this.activeUsers = this.payrollUsers.filter(user => user.status === 'Active');
      this.onHoldUsers = this.payrollUsers.filter(user => user.status === 'OnHold');
      this.processedUsers = this.payrollUsers.filter(user => user.status === 'Processed');
    });
  }

  onSubmission(modal: any) {
    if (this.activeTab === 'tabActiveEmployees') {
      this.payrollUserForm.patchValue({ status: 'OnHold' });
    } else if (this.activeTab === 'tabEmployeesOnHold') {
      this.payrollUserForm.patchValue({ status: 'Processed' });
    } else if (this.activeTab === 'tabProcessedEmployees') {
      this.payrollUserForm.patchValue({ status: 'Active'})
    }
    this.payrollUserForm.patchValue({ payroll: this.selectedPayroll?._id , user: this.selectedRecord?.user});
    this.payrollService.updatePayrollUser(this.selectedRecord?._id, this.payrollUserForm.value).subscribe(
      (res: any) => {
        this.toast.success('Successfully updated');
        this.getPayrollById();
        modal.close();
      },
      (error) => {
        this.toast.error('Update failed', 'Error');
      }
    );
}

}