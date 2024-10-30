import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-7',
  templateUrl: './step-7.component.html',
  styleUrl: './step-7.component.css'
})
export class Step7Component {
  searchText: string = '';
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  overtime: any;
  overtimeForm: FormGroup;
  users: any;

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private toast: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private payrollService: PayrollService
  ) {
    this.overtimeForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      OverTime: ['', Validators.required],
      LateComing: ['', Validators.required],
      EarlyGoing: ['', Validators.required],
      FinalOvertime: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
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

  getOvertime() {
    this.payrollService.getOvertime().subscribe((res: any) => {
      this.overtime = res.data;
    })
  }

  onSubmission() {
    if (this.changeMode == 'Add') {
      console.log('Call API to add Overtime');
      console.log(this.overtimeForm.value);
      this.payrollService.addOvertime(this.overtimeForm.value).subscribe((res: any) => {
        console.log(res.data);
      })
    }
    if (this.changeMode == 'Update') {
      console.log('Call API to Update Overtime');
      let id: string;
      this.payrollService.updateOvertime(id, this.overtimeForm.value).subscribe((res: any) => {
        console.log(res.data);
      })
    }
  }

  deleteTemplate(_id: string) {
    // this.leaveService.deleteTemplate(_id).subscribe((res: any) => {
    //   this.getLeaveTemplates();
    //   if(res != null){
    //     const index = this.templates.findIndex(temp => temp._id === _id);
    //     if (index !== -1) {
    //       this.templates.splice(index, 1);
    //     }
    //   }
    //   this.toast.success('Successfully Deleted!!!', 'Leave Template')
    // },
    //   (err) => {
    //     this.toast.error('This Leave is already being used! Leave template, Can not be deleted!')
    //   })
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