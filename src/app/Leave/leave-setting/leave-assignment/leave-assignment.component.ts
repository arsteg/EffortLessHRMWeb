import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
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
  public sortOrder: string = ''; // 'asc' or 'desc',
  defaultnext= "100000";
  defaultskip= "0";
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100]; // Add the available options for records per page
  recordsPerPage: number = 10; // Default records per page
  totalRecords: number=0; // Total number of records
  currentPage: number = 1;
  skip: string = '0';
  next = '10';
  showApprovers: boolean = false;

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
    this.templateAssignmentForm.get('leaveTemplate')?.valueChanges.subscribe(value => {
      this.onTemplateChange(value);
    });
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.getTemplateAssignments();
    });
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
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
        if(res.status == 'success'){
          const templateAssignment = res.data;
          this.templateAssignment.push(templateAssignment);
          this.toast.success('Employee assigned to the Template', 'Successfully!!!');
          this.templateAssignmentForm.reset();
          this.modalService.dismissAll();
        }
      },
        err => {
          this.toast.error('Employee cannot be assigned to the Template', 'Error')
        })
    }
    else{
      const id = this.selectedLeaveAssignment._id
      this.leaveService.addLeaveTemplateAssignment(payload).subscribe((res: any)=>{
        if(res.status == 'success'){
          const updatedLeaveAssignment = res.data;
          const index = this.templateAssignment.findIndex(category => category._id === updatedLeaveAssignment._id);
          if (index !== -1) {
            this.templateAssignment[index] = updatedLeaveAssignment;
          }
          this.toast.success('Leave assignment Updated', 'Successfully!!!');
          this.modalService.dismissAll();
        }
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
    const requestBody = { "skip": this.defaultskip, "next": this.defaultnext };
    this.leaveService.getLeavetemplates(requestBody).subscribe((res: any) => {
      this.templates = res.data;
    })
  }

  getTemplateAssignments() {
    const requestBody = { "skip": this.skip, "next": this.next };
    this.leaveService.getLeaveTemplateAssignment(requestBody).subscribe((res: any) => {
      if(res.status == "success"){
        this.templateAssignment = res.data;
        this.totalRecords = res.total;
        this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
      }
    })
  }

  getTemplateLabel(leaveTemplate: string): string {
    const matchingCategory = this.templates?.find(template => template?._id === leaveTemplate);
    return matchingCategory?.label;
  }

  onTemplateChange(templateId: string): void {
    const selectedTemplate = this.templates.find(temp => temp._id === templateId);
    if (selectedTemplate && selectedTemplate.approvalType === 'template-wise') {
      this.showApprovers = false;
    } else {
      this.showApprovers = true;
    }
    this.templateAssignmentForm.patchValue({
      primaryApprover: [''],
      secondaryApprover: ['']
    });
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

  // //Pagging related functions
  nextPagination() {
    if (!this.isNextButtonDisabled()) {
      const newSkip = (parseInt(this.skip) + parseInt(this.next)).toString();
      this.skip = newSkip;
      this.getTemplateAssignments();
    }
  }

  previousPagination() {
    if (!this.isPreviousButtonDisabled()) {
      const newSkip = (parseInt(this.skip) >= parseInt(this.next)) ? (parseInt(this.skip) - parseInt(this.next)).toString() : '0';
      this.skip = newSkip;
      this.getTemplateAssignments();
    }
  }
  firstPagePagination() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.skip = '0';
      this.next = this.recordsPerPage.toString();
      this.getTemplateAssignments();
    }
  }
  lastPagePagination() {
    const totalPages = this.getTotalPages();
    if (this.currentPage !== totalPages) {
      this.currentPage = totalPages;
      this.updateSkip();
      this.getTemplateAssignments();
    }
  }
  updateSkip() {
    const newSkip = (this.currentPage - 1) * this.recordsPerPage;
    this.skip = newSkip.toString();
  }

  isNextButtonDisabled(): boolean {
    return this.currentPage === this.getTotalPages();
  }

  isPreviousButtonDisabled(): boolean {
    return this.skip === '0' || this.currentPage === 1;
  }
  updateRecordsPerPage() {
    this.currentPage = 1;
    this.skip = '0';
    this.next = this.recordsPerPage.toString();
    this.getTemplateAssignments();
  }
  getTotalPages(): number {
    const totalCount = this.totalRecords;
    return Math.ceil(totalCount / this.recordsPerPage);
  }
}
