import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-leave-Assignment',
  templateUrl: './leave-assignment.component.html',
  styleUrls: ['./leave-assignment.component.css']
})
export class LeaveAssignmentComponent implements OnInit {
  closeResult: string = '';
  selectedLeaveAssignment: any;
  isEdit: boolean = false;
  searchText: string = '';
  p: number = 1;
  templateAssignmentForm: FormGroup;
  users: any[] = [];
  templates: any;
  templateAssignment: any;
  public sortOrder: string = ''; // 'asc' or 'desc'

  constructor(private modalService: NgbModal,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {
    this.templateAssignmentForm = this.fb.group({
      user: ['', Validators.required],
      leaveTemplate: ['', Validators.required],
      primaryApprover: [''],
      secondaryApprover: ['']
    })
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.getAlltemplates();
    this.getTemplateAssignments();
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

  onSubmission() {
    let payload = {
      user: this.templateAssignmentForm.value.user,
      leaveTemplate: this.templateAssignmentForm.value.leaveTemplate,
      primaryApprover: this.templateAssignmentForm.value.primaryApprover,
      secondaryApprover: this.templateAssignmentForm.value.secondaryApprover
    }
    if (!this.isEdit) {
      this.leaveService.addLeaveTemplateAssignment(payload).subscribe((res: any) => {
        const templateAssignment = res.data;
        this.templateAssignment.push(templateAssignment);
        this.toast.success('Employee assigned to the Template', 'Successfully!!!');
        this.templateAssignmentForm.reset();
      },
        err => {
          this.toast.error('Employee cannot be assigned to the Template', 'Error')
        })
    }
    else{
      const id = this.selectedLeaveAssignment._id
      this.leaveService.addLeaveTemplateAssignment(payload).subscribe((res: any)=>{

        const updatedLeaveAssignment = res.data;
        const index = this.templateAssignment.findIndex(category => category._id === updatedLeaveAssignment._id);
        if (index !== -1) {
          this.templateAssignment[index] = updatedLeaveAssignment;
        }
        this.toast.success('Leave assignment Updated', 'Successfully!!!');

      },
      err =>{
        this.toast.error('Leave Assignment can not be updated', 'Error!!!')
      })
    }
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  getAlltemplates() {
    this.leaveService.getLeavetemplates().subscribe((res: any) => {
      this.templates = res.data;
    })
  }

  getTemplateAssignments() {
    this.leaveService.getLeaveTemplateAssignment().subscribe((res: any) => {
      this.templateAssignment = res.data;
    })
  }

  getTemplateLabel(leaveTemplate: string): string {
    const matchingCategory = this.templates?.find(template => template?._id === leaveTemplate);
    return matchingCategory?.label;
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

  editTemplateAssignment(templateAssignment) {
    this.isEdit = true;
    console.log(templateAssignment)
    this.templateAssignmentForm.patchValue({
      user:templateAssignment.user,
      leaveTemplate: templateAssignment.leaveTemplate,
      primaryApprover: templateAssignment.primaryApprover,
      secondaryApprover: templateAssignment.secondaryApprover
    });
  }

  deleteTemplateAssignment(_id: string) {
    this.leaveService.deleteTemplateAssignment(_id).subscribe((res: any) => {
      const index = this.templateAssignment.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.templateAssignment.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Leave Template Assignment')
    },
      (err) => {
        this.toast.error('Leave Template Assignment', 'Can not be Deleted!')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplateAssignment(id);
      }
    });
  }

}
