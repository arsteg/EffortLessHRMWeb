import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-other-benefits',
  templateUrl: './other-benefits.component.html',
  styleUrl: './other-benefits.component.css'
})
export class OtherBenefitsComponent {

  closeResult: string;
  isEdit: boolean = false;
  selectedRecord: any;
  otherBenefits: any;
  otherBenefitForm: FormGroup;
  searchText: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  user: any;

  constructor(private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private auth: AuthenticationService
  ) {
    this.otherBenefitForm = this.fb.group({
      label: ['', Validators.required],
      isEffectAttendanceOnEligibility: [true, Validators.required],
      company: ['']
    });
    
  }

  ngOnInit() {
    this.getOtherBenefits();
  }

  clearForm() {
    this.otherBenefitForm.patchValue({
     label: '',
      isEffectAttendanceOnEligibility: true 
    })
  }
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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

  onSubmission() {
    this.auth.GetMe(this.currentUser.id).subscribe((res: any) => {
      this.user = res.data.users;
      this.otherBenefitForm.value.company = this.user.company.id;
      console.log(this.otherBenefitForm.value)
   
    if (!this.isEdit) {
      this.payroll.addOtherBenefits(this.otherBenefitForm.value).subscribe((res: any) => {
        this.otherBenefits.push(res.data);
        this.toast.success('Successfully Added!!!', 'Other Benefit');
        this.otherBenefitForm.reset();
      },
        (err) => {
          this.toast.error('Other Benefit Can not be added', 'Other Benefit');
        })
    }
    else {
      this.payroll.updateOtherBenefits(this.selectedRecord._id, this.otherBenefitForm.value).subscribe((res: any) => {
        this.toast.success('Successfully Updated!!!', 'Other Benefit');
        const reason = res.data;
        const index = this.otherBenefits.findIndex(reas => reas._id === reason._id);
        if (index !== -1) {
          this.otherBenefits[index] = reason;
        }
      },
        (err) => {
          this.toast.error('Other Benefit Can not be Updated', 'Other Benefit');
        })
    }
  });
  }
  editRecord() {
    this.otherBenefitForm.patchValue(this.selectedRecord)
  }

  deleteRecord(_id: string) {
    this.payroll.deleteOtherBenefits(_id).subscribe((res: any) => {
      const index = this.otherBenefits.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.otherBenefits.splice(index, 1);
        this.totalRecords--;
      }
      this.toast.success('Successfully Deleted!!!', 'Other Benefit');
    },
      (err) => {
        this.toast.error('Other Benefit Can not be deleted', 'Other Benefit');
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

  onPageChange(page: number) {
    this.currentPage = page;
    this.getOtherBenefits();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getOtherBenefits();
  }

  getOtherBenefits() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getOtherBenefits(pagination).subscribe(res => {
      this.otherBenefits = res.data;
      this.totalRecords = res.total;
    })
  }
}
