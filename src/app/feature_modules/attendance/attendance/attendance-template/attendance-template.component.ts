import { Component, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ExportService } from 'src/app/_services/export.service';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { ActionVisibility } from 'src/app/models/table-column';
import { forkJoin } from 'rxjs'; // Import forkJoin
import { TranslateService } from '@ngx-translate/core';
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
  totalRecords: number = 0; // example total records
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';
  @ViewChild('addModal') addModal: any;
  dialogRef: MatDialogRef<any> | null = null;
  allData: any;

  columns = [
    {
      key: 'label',
      name: 'Attendance Template'
    },
    {
      key: 'employeeCount',
      name: 'Number of Employees Covered',
      sortable: false,
      valueFn: (row: any) => this.templateAssignmentCount[row._id] || 0,
    },
    {
      key: 'actions',
      name: 'Actions',
      isAction: true,
      options: [
        {
          label: 'Edit',
          icon: 'edit',
          visibility: ActionVisibility.LABEL
        },
        {
          label: 'Delete',
          icon: 'delete',
          visibility: ActionVisibility.LABEL
        },
      ],
    },
  ];

  constructor(
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
     private translate: TranslateService,
    
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    this.loadAllData(); // Call a new method to load both
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
        this.allData = templateRes.data;
        this.totalRecords = templateRes.total;
        this.attendanceAssignment = assignmentRes.data;
        this.updateTemplateAssignmentCount(); // Call after both are populated
      },
      (error) => {
        console.error('Error loading attendance data:', error);
        const errorMessage = error?.error?.message || this.translate.instant('attendance.loadTemplatesError');
          this.toast.error(errorMessage, this.translate.instant('common.error'));
      }
    );
  }
  // }

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
          const errorMessage = error?.error?.message || this.translate.instant('attendance.loadTemplatesError');
          this.toast.error(errorMessage, this.translate.instant('common.error'));
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
        const errorMessage = error?.error?.message || this.translate.instant('attendance.loadAssignmentsError');
        this.toast.error(errorMessage, this.translate.instant('common.error'));
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
    this.changeMode = this.isEdit ? 'Next' : 'Add';
    this.dialogRef = this.dialog.open(content, {
      data: { templateRef: this.addModal, title: `${this.changeMode} Template` },
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(() => {
    });
  }

  onChangeStep(event) {
    this.step = event;
  }

  onChangeMode(event) {
    if ((this.isEdit = true)) {
      this.changeMode = event;
    }
  }

  onClose(event: boolean) {
    if (event && this.dialogRef) {
      this.dialogRef.close();
    }
  }

  refreshExpenseReportTable() {
    this.loadAllData();
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
    this.exportService.exportToCSV('attendance-template', 'attendance-template', combinedData);
  }

  setFormValues(templateData: any) {
    this.attendanceService.selectedTemplate.next(templateData);
  }

  deleteTemplate(id: string) {
    this.attendanceService.deleteAttendanceTemplate(id).subscribe(
      (res: any) => {
        this.loadAllData(); // Reload all data after deletion to update counts
        this.toast.success(
          this.translate.instant('attendance.deleteAttendanceTemplateSuccess'),
          this.translate.instant('attendance.templateTitle')
        );
      },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('attendance.deleteError')
        ;
        this.toast.error(errorMessage, this.translate.instant('common.error'));
  
        console.error('Delete error:', err); // Log the full error for debugging
      }
    );
  }

  deleteDialog(templateId: string): void {
    // Check if the template has assignments before opening the confirmation dialog
    if (this.templateAssignmentCount && this.templateAssignmentCount[templateId] > 0) {
      this.toast.error(
        this.translate.instant('attendance.deleteRestricted')
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
      // No need for an 'err' callback here, as errors from deleteTemplate are handled there.
    });
  }

  getRegularizations() {
    this.attendanceService.getRegularizations().subscribe((res: any) => {
      this.regularizations = res.data;
    });
  }

  onPageChangev1(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.loadRecords();
  }

  onSearchChange(event: any) {
    this.attendanceTemplate = this.allData?.filter(row => {
    return this.columns.some(col => {
      const value = row[col.key];
      return value?.toString().toLowerCase().includes(event.toLowerCase());
    });
  });
  }

  onActionClick(event: any){
    switch (event.action.label) {
      case 'Edit':
        this.changeMode='Next';
        this.step = 1;
        this.isEdit= true;
        this.selectedTemplateId=event?.row?._id;
        this.setFormValues(event?.row);
        this.open(this.addModal);
        break;
      case 'Delete':
        this.deleteDialog(event?.row?._id);
        break;
    }
  }

  // onSortChange(event: any) {
  //   const sorted = this.allData.slice().sort((a, b) => {
  //     return event.direction === 'asc' ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
  //   });
  //   this.attendanceTemplate = sorted;
  // }

   onSortChange(event: any) {
    const sorted = this.attendanceTemplate.slice().sort((a: any, b: any) => {
      const valueA = this.getNestedValue(a, event.active);
      const valueB = this.getNestedValue(b, event.active);
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.attendanceTemplate = sorted;
  }

  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  }
}