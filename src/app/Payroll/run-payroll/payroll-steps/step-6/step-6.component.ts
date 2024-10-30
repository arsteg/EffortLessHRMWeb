import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { SelectedUser } from 'src/app/viewLiveScreen/view-live-screen/view-live-screen.component';

@Component({
  selector: 'app-step-6',
  templateUrl: './step-6.component.html',
  styleUrl: './step-6.component.css'
})
export class Step6Component {
  searchText: string = '';
  closeResult: string = '';
  flexiBenefitsForm: FormGroup;
  flexiBenefits: any;
  changeMode: 'Add' | 'Update' = 'Add';
  users: any;
  @Input() selectedPayroll: any;

  constructor(private modalService: NgbModal,
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
    })
  }

  ngOnInit() {
    console.log(this.selectedPayroll);
    this.getAllUsers();
    this.getFlexiBenefitsProfessionalTax();
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  getFlexiBenefitsProfessionalTax() {
    this.payrollService.getFlexiByUsers(this.selectedPayroll).subscribe((res: any) => {
      this.flexiBenefits = res.data.records;
      console.log(res.data);
    })
  }

  onSubmission() {
    if (this.changeMode == 'Add') {
      this.payrollService.addFlexi(this.flexiBenefitsForm.value).subscribe((res: any) => {
        this.flexiBenefits = res.data;
      })
    }
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

  deleteTemplate(_id: string) {
    this.payrollService.deleteFlexi(_id).subscribe((res: any) => {
      if (res != null) {
        // const index = this.templates.findIndex(temp => temp._id === _id);
        // if (index !== -1) {
        // this.templates.splice(index, 1);
        // }
      }
      this.toast.success('Successfully Deleted!!!', 'Flexi Benefits and Professional Tax')
    },
      (err) => {
        this.toast.error('This Flexi Benefits and Professional Tax Can not be deleted!')
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
