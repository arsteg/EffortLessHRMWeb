import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/_services/common.Service';
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
  allAssignee: any[];
  templateById: any;
  templates: any;
  bsValue = new Date();
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';

  constructor(
    private attendanceService: AttendanceService,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private commonService: CommonService,
    private fb: FormBuilder,

  ) {
    this.onDutyTempAssignForm = this.fb.group({
      user: [''],
      onDutyTemplate: [''],
      effectiveFrom: [],
      primaryApprovar: [null],
      secondaryApprovar: [null],
      skip: [''],
      next: ['']
    })
  }

  ngOnInit() {
    this.getOnDutyTemplates();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.loadRecords();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRecords();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.loadRecords();
  }

  loadRecords() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.attendanceService.getOnDutyAssignmentTemplate(pagination.skip, pagination.next).subscribe((res: any) => {
      this.templateAssigments = res.data;
      this.totalRecords = res.total;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }
  getOnDutyTemplateName(templateId: string) {
    const template = this.templates?.find(temp => temp._id === templateId);
    return template ? template.name : '';
  }

  getOnDutyTemplates() {
    this.attendanceService.getOnDutyTemplate('', '').subscribe((res: any) => {
      this.templates = res.data;
    });
  }



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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  setFormValues(data) {
    this.onDutyTempAssignForm.patchValue({
      user: data.user,
      onDutyTemplate: data.onDutyTemplate,
      effectiveFrom: data.effectiveFrom,
      primaryApprovar: data.primaryApprovar,
      secondaryApprovar: data.secondaryApprovar
    })
  }

  deleteTemplate(id: string) {
    this.attendanceService.deleteOnDutyAssignmentTemplate(id).subscribe((res: any) => {
      this.loadRecords();
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
      user: this.getUser(data.user),
      onDutyTemplate: this.getOnDutyTemplateName(data.onDutyTemplate),
      effectiveFrom: data.effectiveFrom,
      primaryApprovar: this.getUser(data.primaryApprovar),
      secondaryApprovar: this.getUser(data.secondaryApprovar)
    }));
    this.exportService.exportToCSV('onDuty-template-Assignment', 'onDuty-template-assignment', dataToExport);
  }

  onTemplateSelectionChange(event: any) {
    const selectedTemplateId = event.target.value;

    this.attendanceService.getOnDutyTemplateById(selectedTemplateId).subscribe((res: any) => {
      this.templateById = res.data;

      if (this.templateById.ApprovarType === 'template-wise') {
        if (this.templateById.ApprovalLevel === '1') {
          this.onDutyTempAssignForm.patchValue({
            primaryApprovar: this.templateById.FirstLevelApprovar,
            secondaryApprovar: null
          });
          this.onDutyTempAssignForm.get('primaryApprovar').disable();

        } else if (this.templateById.ApprovalLevel === '2') {
          this.onDutyTempAssignForm.patchValue({
            primaryApprovar: this.templateById.FirstLevelApprovar,
            secondaryApprovar: this.templateById.SecondLevelApprovar
          });
          console.log(this.onDutyTempAssignForm.value)
        }
        this.onDutyTempAssignForm.get('primaryApprovar').disable();
        this.onDutyTempAssignForm.get('secondaryApprovar').disable();
      } else if (this.templateById.ApprovarType === 'employee-wise') {
        this.onDutyTempAssignForm.patchValue({
          primaryApprovar: null,
          secondaryApprovar: null
        });

        this.onDutyTempAssignForm.get('primaryApprovar').enable();
        this.onDutyTempAssignForm.get('secondaryApprovar').enable();
      }
    });
  }

  onSubmission() {
    this.onDutyTempAssignForm.get('primaryApprovar').enable();
    this.onDutyTempAssignForm.get('secondaryApprovar').enable();
    let payload = {
      user: this.onDutyTempAssignForm.value.user,
      onDutyTemplate: this.onDutyTempAssignForm.value.onDutyTemplate,
      effectiveFrom: this.onDutyTempAssignForm.value.effectiveFrom,
      primaryApprovar: this.onDutyTempAssignForm.value.primaryApprovar,
      secondaryApprovar: this.onDutyTempAssignForm.value.secondaryApprovar
    }
    if (this.templateById.ApprovarType === 'template-wise') {
      this.onDutyTempAssignForm.get('primaryApprovar').disable();
      this.onDutyTempAssignForm.get('secondaryApprovar').disable();
    }

    console.log(payload)
    if (!this.isEdit) {
      console.log(payload);
      this.attendanceService.addOnDutyAssignmentTemplate(payload).subscribe((res: any) => {
        this.loadRecords();
        this.toast.success('OnDuty Template Assigned', 'Successfully');
        this.onDutyTempAssignForm.reset();
      })
    }
    else {
      this.attendanceService.updateOnDutyAssignmentTemplate(this.selectedTemplateId, payload).subscribe((res: any) => {
        this.loadRecords();
        this.toast.success('OnDuty Template Assignment Updated', 'Successfully');
        this.onDutyTempAssignForm.reset();
      })
    }
  }

}
