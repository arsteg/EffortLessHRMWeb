import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  selectedTemplate: any;
  users: any[];
  templateAssignments: any;
  allAssignee: any[];
  templateById: any;
  templates: any;
  bsValue = new Date();
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';
  errorMessage: string = '';
  userAlreadyExists: boolean = false;

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
      user: ['', Validators.required],
      onDutyTemplate: ['', Validators.required],
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
      this.templateAssignments = res.data;
      this.totalRecords = res.total;
    })
  }
  checkIfUserExists(event: Event) {
    const selectedUserId = (event.target as HTMLSelectElement).value;
    this.userAlreadyExists = this.templateAssignments.some(
      (assignment) => assignment.user === selectedUserId
    );

    if (this.userAlreadyExists) {
      this.onDutyTempAssignForm.get('user')?.setErrors({ alreadyAssigned: true });
    } else {
      this.onDutyTempAssignForm.get('user')?.setErrors(null);
    }
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
    if (this.isEdit === false) {
      this.onDutyTempAssignForm.get('user').enable();
      this.onDutyTempAssignForm.reset({
        user: '',
        onDutyTemplate: '',
        effectiveFrom: new Date(),
        primaryApprovar: '',
        secondaryApprovar: ''
      });
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  setFormValues() {
    if (this.isEdit) {
      const data = this.selectedTemplate;
      this.onDutyTempAssignForm.patchValue({
        user: data.user,
        onDutyTemplate: data.onDutyTemplate,
        effectiveFrom: data.effectiveFrom,
        primaryApprovar: data.primaryApprovar,
        secondaryApprovar: data.secondaryApprovar
      });
      if (this.isEdit) {
        this.onDutyTempAssignForm.get('user').disable();
      }
    }
    if (!this.isEdit) {
      this.onDutyTempAssignForm.reset({
        user: '',
        onDutyTemplate: '',
        effectiveFrom: new Date(),
        primaryApprovar: '',
        secondaryApprovar: ''
      });
    }
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
    const dataToExport = this.templateAssignments.map((data) => ({
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
    if (this.templateById?.ApprovarType === 'template-wise') {
      this.onDutyTempAssignForm.get('primaryApprovar').disable();
      this.onDutyTempAssignForm.get('secondaryApprovar').disable();
    }

    if (this.onDutyTempAssignForm.valid) {
      if (!this.isEdit) {
        this.attendanceService.addOnDutyAssignmentTemplate(payload).subscribe((res: any) => {
          this.loadRecords();
          this.toast.success('OnDuty Template Assigned', 'Successfully');
          this.onDutyTempAssignForm.patchValue({
            user: '',
            onDutyTemplate: '',
            effectiveFrom: new Date(),
            primaryApprovar: '',
            secondaryApprovar: '',
          })
          this.onDutyTempAssignForm.get('primaryApprovar').enable();
          this.onDutyTempAssignForm.get('secondaryApprovar').enable();
        })
      }
      else {
        this.attendanceService.updateOnDutyAssignmentTemplate(this.selectedTemplate?._id, payload).subscribe((res: any) => {
          this.loadRecords();
          this.toast.success('OnDuty Template Assignment Updated', 'Successfully');
          this.isEdit = false;
          this.onDutyTempAssignForm.reset({
            user: '',
            onDutyTemplate: '',
            effectiveFrom: new Date(),
            primaryApprovar: '',
            secondaryApprovar: ''
          });
          this.onDutyTempAssignForm.get('primaryApprovar').enable();
          this.onDutyTempAssignForm.get('secondaryApprovar').enable();
          this.onDutyTempAssignForm.get('user').enable();
        })
      }
    }
    else { this.onDutyTempAssignForm.markAllAsTouched() }
  }

}
