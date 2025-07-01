import { Component } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { ExportService } from 'src/app/_services/export.service';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs'; // Import forkJoin

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
  attendanceTemplate: any[] = []; // Initialize as empty array
  selectedTemplateId: any;
  changeMode: 'Add' | 'Next' = 'Add';
  regularizations: any;
  attendanceAssignment: any[] = []; // Initialize as empty array
  templateAssignmentCount: { [key: string]: number } = {}; // Initialize as empty object
  totalRecords: number; // example total records
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';

  constructor(
    private modalService: NgbModal,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    this.loadAllData(); // Call a new method to load both
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRecords(); // This will now properly trigger assignment count update
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.loadRecords(); // This will now properly trigger assignment count update
  }

  loadAllData() {
    // Use forkJoin to wait for both observables to complete
    forkJoin([
      this.attendanceService.getAttendanceTemplate(
        ((this.currentPage - 1) * this.recordsPerPage).toString(),
        this.recordsPerPage.toString()
      ),
      this.attendanceService.getAttendanceAssignment('', ''), // Assuming no pagination for assignments needed here
    ]).subscribe(
      ([templateRes, assignmentRes]: [any, any]) => {
        this.attendanceTemplate = templateRes.data;
        this.totalRecords = templateRes.total;
        this.attendanceAssignment = assignmentRes.data;
        this.updateTemplateAssignmentCount(); // Call after both are populated
      },
      (error) => {
        console.error('Error loading attendance data:', error);
        this.toast.error('Failed to load attendance data.', 'Error');
      }
    );
  }

  loadRecords() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
    };
    this.attendanceService
      .getAttendanceTemplate(pagination.skip, pagination.next)
      .subscribe(
        (res: any) => {
          this.attendanceTemplate = res.data;
          this.totalRecords = res.total;
          // Always ensure assignments are loaded when templates are, or update count if they already are
          if (!this.attendanceAssignment || this.attendanceAssignment.length === 0) {
              this.getAttendanceTemplateAssignment(); // Fetch assignments if not already there
          } else {
              this.updateTemplateAssignmentCount(); // Otherwise, just update the count
          }
        },
        (error) => {
          console.error('Error loading attendance templates:', error);
          this.toast.error('Failed to load attendance templates.', 'Error');
        }
      );
  }

  getAttendanceTemplateAssignment() {
    this.attendanceService.getAttendanceAssignment('', '').subscribe(
      (res: any) => {
        this.attendanceAssignment = res.data;
        this.updateTemplateAssignmentCount(); // Call after assignments are populated
      },
      (error) => {
        console.error('Error loading attendance assignments:', error);
        // Handle error if needed
      }
    );
  }

  updateTemplateAssignmentCount() {
    // Add checks to ensure both arrays are valid before processing
    if (
      this.attendanceTemplate &&
      this.attendanceTemplate.length > 0 &&
      this.attendanceAssignment &&
      this.attendanceAssignment.length > 0
    ) {
      this.templateAssignmentCount = this.attendanceTemplate.reduce(
        (acc, template) => {
          const count = this.attendanceAssignment.filter(
            (assignment) => assignment.attendanceTemplate?._id === template._id
          ).length;
          return { ...acc, [template?._id]: count };
        },
        {} // Initialize accumulator as an empty object
      );
    } else {
      this.templateAssignmentCount = {}; // Ensure it's always an object if data isn't ready
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
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  onChangeStep(event) {
    this.step = event;
  }

  onChangeMode(event) {
    if ((this.isEdit = true)) {
      this.changeMode = event;
    }
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
      this.loadAllData(); // Reload all data to ensure counts are fresh after modal close (e.g., add/edit)
    }
  }

  refreshExpenseReportTable() {
    this.loadAllData(); // Reload all data, not just templates
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
      'Duration per Week',
    ];

    const dataToExport = this.attendanceTemplate.map((template) => {
      const attendanceModes = template.attendanceMode.join(', ');
      const leveCategoryHierarchyForAbsentHalfDay =
        template.leveCategoryHierarchyForAbsentHalfDay.join(',');
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
        durationPerWeek,
      ];
    });

    const combinedData = [headers, ...dataToExport];

    // Call the export service with combined data
    this.exportService.exportToCSV(
      'attendance-template',
      'attendance-template',
      combinedData
    );
  }

  setFormValues(templateData: any) {
    this.attendanceService.selectedTemplate.next(templateData);
  }

  deleteTemplate(id: string) {
    this.attendanceService.deleteAttendanceTemplate(id).subscribe(
      (res: any) => {
        this.loadAllData(); // Reload all data after deletion to update counts
        this.toast.success('Successfully Deleted!!!', 'Attendance Template');
      },
      (err) => {
        this.toast.error('Error deleting attendance template.', 'Error');
        console.error('Delete error:', err); // Log the full error for debugging
      }
    );
  }

  deleteDialog(templateId: string): void {
    // Check if the template has assignments before opening the confirmation dialog
    if (
      this.templateAssignmentCount &&
      this.templateAssignmentCount[templateId] > 0
    ) {
      this.toast.error(
        'This template cannot be deleted because it is assigned to employees.',
        'Deletion Restricted'
      );
      return; // Stop the deletion process
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(templateId);
      }
    });
  }

  getRegularizations() {
    this.attendanceService.getRegularizations().subscribe((res: any) => {
      this.regularizations = res.data;
    });
  }
}