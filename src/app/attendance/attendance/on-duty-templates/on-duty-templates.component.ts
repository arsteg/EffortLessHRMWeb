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
  selector: 'app-on-duty-templates',
  templateUrl: './on-duty-templates.component.html',
  styleUrl: './on-duty-templates.component.css'
})
export class OnDutyTemplatesComponent {
  p: number = 1;
  searchText: string = '';
  isEdit: boolean = false;
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  selectedTemplateId: string;
  onDutyTemplate: any;
  onDutyTempForm: FormGroup;
  users: any[];

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private attendanceService: AttendanceService,
    private fb: FormBuilder,
    private commonService: CommonService) {

    this.onDutyTempForm = this.fb.group({
      name: [''],
      isCommentMandatory: [true],
      canSubmitForMultipleDays: [true],
      ApprovalLevel: [''],
      FirstApproverCommentsMandatoryforApproval: [true],
      SecondApproverCommentsMandatoryforApproval: [true],
      FirstApproverCommentsMandatoryforRejection: [true],
      SecondApproverCommentsMandatoryforRejection: [true],
      IntitiateDutyRequestBy: [['']],
      ApprovarType: [''],
      FirstLevelApprovar: [null],
      SecondLevelApprovar: [null]
    });

  }

  ngOnInit() {
    this.getAllUsers();
    this.getOnDutyTemplates();
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

  setFormValues(data) {
    this.onDutyTempForm.patchValue({
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
      FirstLevelApprovar: data.FirstLevelApprovar,
      SecondLevelApprovar: data.SecondLevelApprovar
    });
    console.log(this.onDutyTempForm.value);
  }

  getOnDutyTemplates() {
    this.attendanceService.getOnDutyTemplate().subscribe((res: any) => {
      this.onDutyTemplate = res.data;
    })
  }

  onSubmission() {
    if (!this.isEdit) {
      this.attendanceService.addOnDutyTemplate(this.onDutyTempForm.value).subscribe((res: any) => {
        this.getOnDutyTemplates();
        this.toast.success('Successfully Created!!!', 'OnDuty Template');

      }, (err) => {
        this.toast.error('This OnDuty Template Can not be Created', 'Error')
      })
    }
    else {
      this.attendanceService.updateOnDutyTemplate(this.selectedTemplateId, this.onDutyTempForm.value).subscribe((res: any) => {
        this.getOnDutyTemplates();
        this.toast.success('Successfully Updated!!!', 'OnDuty Template');

      }, (err) => {
        this.toast.error('This OnDuty Template Can not be Updated', 'Error')
      })
    }
  }

  deleteTemplate(id: string) {
    this.attendanceService.deleteOnDutyTemplate(id).subscribe((res: any) => {
      this.getOnDutyTemplates();
      this.toast.success('Successfully Deleted!!!', 'OnDuty Template');
    },
      (err) => {
        this.toast.error('This OnDuty Template Can not be deleted', 'Error')
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
    const dataToExport = this.onDutyTemplate.map((data) => ({
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
    this.exportService.exportToCSV('attendance-template', 'attendance-template', dataToExport);
  }
  closeModal() {
    this.modalService.dismissAll();
  }
}