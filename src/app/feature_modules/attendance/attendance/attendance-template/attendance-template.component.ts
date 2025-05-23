import { Component } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { ExportService } from 'src/app/_services/export.service';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-attendance-template',
  templateUrl: './attendance-template.component.html',
  styleUrl: './attendance-template.component.css',
})
export class AttendanceTemplateComponent {
  closeResult: string = '';
  p: number = 1;
  step: number = 1;
  searchText: string = '';
  isEdit: boolean = false;
  attendanceTemplate: any;
  selectedTemplateId: any;
  changeMode: 'Add' | 'Next' = 'Add';
  regularizations: any;
  attendanceAssignment: any;
  templateAssignmentCount;
  totalRecords: number // example total records
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private attendanceService: AttendanceService) { }

  ngOnInit() {
    this.getAttendanceTemplateAssignment();
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
    this.attendanceService.getAttendanceTemplate(pagination.skip, pagination.next).subscribe((res: any) => {
      this.attendanceTemplate = res.data;
      this.totalRecords = res.total;
      this.updateTemplateAssignmentCount();
    });
  }

  getAttendanceTemplateAssignment() {
    this.attendanceService.getAttendanceAssignment('', '').subscribe((res: any) => {
      this.attendanceAssignment = res.data;
      this.updateTemplateAssignmentCount();
    });
  }

  updateTemplateAssignmentCount() {
    if (this.attendanceTemplate?.length > 0 && this.attendanceAssignment?.length > 0) {
      this.templateAssignmentCount = this.attendanceTemplate.reduce((acc, template) => {
        const count = this.attendanceAssignment.filter(assignment => assignment.attendanceTemplate === template._id).length;
        return { ...acc, [template?._id]: count };
      }, {});
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

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onChangeStep(event) {
    this.step = event;
  }

  onChangeMode(event) {
    if (this.isEdit = true) {
      this.changeMode = event
    }
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }

  refreshExpenseReportTable() {
    this.loadRecords();
  }

  exportToCsv() {
    console.log(this.attendanceTemplate);
    const headers = [
      'Label',
      'Alternate Week Off Routine',
      'Approvers Type',
      'Approval Level',
      'Attendance Modes', 
      'Leave Categories',
      'Department Designations',
      'Duration per Week'
    ];

    const dataToExport = this.attendanceTemplate.map(template => {
      const attendanceModes = template.attendanceMode.join(', ');
      const leveCategoryHierarchyForAbsentHalfDay = template.leveCategoryHierarchyForAbsentHalfDay.join(',');
      const hours = template.minimumHoursRequiredPerWeek;
      const minutes = template.minimumMinutesRequiredPerWeek;
      const durationPerWeek = `${hours} Hr ${minutes} Mins`;
  
      return [
        template.label,
        template.alternateWeekOffRoutine,
        template.approversType,
        template.approvalLevel,
        attendanceModes,
        leveCategoryHierarchyForAbsentHalfDay,
        template.departmentDesignations,
        durationPerWeek
      ];
    });

    
    const combinedData = [headers, ...dataToExport];

    // Call the export service with combined data
    this.exportService.exportToCSV('attendance-template', 'attendance-template', combinedData);
  }



  setFormValues(templateData: any) {
    this.attendanceService.selectedTemplate.next(templateData);
  }

  deleteTemplate(id: string) {
    this.attendanceService.deleteAttendanceTemplate(id).subscribe((res: any) => {
      this.loadRecords();
      this.toast.success('Successfully Deleted!!!', 'Attendance Template')
    },
      (err) => {
        this.toast.error('This Attendance Template Can not be deleted'
          , 'Error')
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

  getRegularizations() {
    this.attendanceService.getRegularizations().subscribe((res: any) => {
      this.regularizations = res.data;
    })
  }
}