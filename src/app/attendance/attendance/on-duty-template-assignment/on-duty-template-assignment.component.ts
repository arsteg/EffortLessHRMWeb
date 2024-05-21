import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/common/common.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-on-duty-template-assignment',
  templateUrl: './on-duty-template-assignment.component.html',
  styleUrl: './on-duty-template-assignment.component.css'
})
export class OnDutyTemplateAssignmentComponent {
  onDutyTempAssignForm: FormGroup;
  p: number = 1;
  searchText: string = '';
  isEdit: boolean = false;
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  selectedTemplateId: string;
  users: any[];
  templateAssigments: any;

  constructor(
    private attendanceService: AttendanceService,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private commonService: CommonService,
    private fb: FormBuilder
  ) {
    this.onDutyTempAssignForm = this.fb.group({
      user: [''],
      onDutyTemplate: [''],
      effectiveFrom: [],
      primaryApprovar: [null],
      secondaryApprovar: [null]
    })
  }

  ngOnInit() {
    this.getOnDutyTemplatesAssignment();
    this.getAllUsers();
  }

  getOnDutyTemplatesAssignment() {
    this.attendanceService.getOnDutyAssignmentTemplate().subscribe((res: any) => {
      this.templateAssigments = res.data;
    })
  }

  onSubmission() { }

  closeModal() {
    this.modalService.dismissAll();
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

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  setFormValues(data) { }

  deleteTemplate(id: string) {
    this.attendanceService.deleteOnDutyTemplate(id).subscribe((res: any) => {
      this.getOnDutyTemplatesAssignment();
      this.toast.success('Successfully Deleted!!!', 'OnDuty Template Assignment');
    },
      (err) => {
        this.toast.error('This OnDuty Template Assignment Can not be deleted', 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
  exportToCsv() {
    const dataToExport = this.templateAssigments.map((data) => ({
      name: data.name,
      isCommentMandatory: data.isCommentMandatory,
      canSubmitForMultipleDays: data.canSubmitForMultipleDays,
      ApprovalLevel: data.ApprovalLevel,
      FirstApproverCommentsMandatoryforApproval: data.FirstApproverCommentsMandatoryforApproval,
      SecondApproverCommentsMandatoryforApproval: data.SecondApproverCommentsMandatoryforApproval,
      FirstApproverCommentsMandatoryforRejection: data.FirstApproverCommentsMandatoryforRejection,
      SecondApproverCommentsMandatoryforRejection: data.SecondApproverCommentsMandatoryforRejection,
      IntitiateDutyRequestBy: data.IntitiateDutyRequestBy,
      ApprovarType: data.ApprovarType,
      FirstLevelApprovar: this.getUser(data.FirstLevelApprovar),
      SecondLevelApprovar: this.getUser(data.SecondLevelApprovar)
    }));
    this.exportService.exportToCSV('attendance-template-Assignment', 'attendance-template-assignment', dataToExport);
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
}
