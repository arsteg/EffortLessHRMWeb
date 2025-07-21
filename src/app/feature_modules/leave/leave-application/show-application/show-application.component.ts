import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeaveService } from 'src/app/_services/leave.service';
import { UpdateApplicationComponent } from '../update-application/update-application.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ExportService } from 'src/app/_services/export.service';
import { ViewApplicationComponent } from '../view-application/view-application.component';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { forkJoin, map, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-show-application',
  templateUrl: './show-application.component.html',
  styleUrl: './show-application.component.css'
})
export class ShowApplicationComponent {
  leaveApplication = new MatTableDataSource<any>();
  @Input() status: string;
  closeResult: string = '';
  searchText: string = '';
  @Input() actionOptions: { approve: boolean, reject: boolean, delete: boolean, view: boolean };
  allAssignee: any;
  leaveCategories: any;
  dateControl = new FormControl();
  @Input() tab: number;
  portalView = localStorage.getItem('adminView');
  totalLeaveDays: number;
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  public sortOrder: string = '';
  defaultCatSkip = "0";
  defaultCatNext = "100000";
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  displayedColumns: string[] = ['employee', 'leaveCategory', 'startDate', 'endDate', 'totalLeaveDays', 'status', 'actions'];
  dialogRef: MatDialogRef<any> | null = null;
  allData: any[] = [];
  columns: TableColumn[] = [
    {
      key: 'employee',
      name: this.translate.instant('leave.employee'),
      valueFn: (row: any) => `${row.employee}`
    },
    {
      key: 'leaveCategory',
      name: this.translate.instant('leave.leaveCategory'),
      valueFn: (row: any) => this.getCategory(row.leaveCategory) || ''
    },
    {
      key: 'startDate',
      name: this.translate.instant('leave.startDate'),
      valueFn: (row: any) => this.datePipe.transform(row.startDate, 'mediumDate') || ''
    },
    {
      key: 'endDate',
      name: this.translate.instant('leave.endDate'),
      valueFn: (row: any) => this.datePipe.transform(row.endDate, 'mediumDate') || ''
    },
    {
      key: 'totalLeaveDays',
      name: this.translate.instant('leave.totalLeaveDays'),
      valueFn: (row: any) => row.totalLeaveDays || ''
    },
    {
      key: 'status',
      name: this.translate.instant('leave._status'),
      valueFn: (row: any) => row.status || ''
    },
    {
      key: 'action',
      name: this.translate.instant('leave.actions'),
      isAction: true,
      options: [
        {
          label: 'Approve',
          icon: 'check_circle',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row: any) => !this.actionOptions.approve || !this.checkForApproval(row) || ( this.portalView === 'user' && ( this.portalView === 'user' && this.tab != 5))
        },
        {
          label: 'Reject',
          icon: 'person_remove',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row: any) => !this.actionOptions.reject || ( this.portalView === 'user' && ( this.portalView === 'user' && this.tab != 5))
        },
        {
          label: 'Delete',
          icon: 'delete',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row: any) => !this.actionOptions.delete
        },
        {
          label: 'View',
          icon: 'visibility',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row: any) => !this.actionOptions.view
        }
      ]
    }
  ];

  constructor(
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private commonService: CommonService,
    private toast: ToastrService,
    private datePipe: DatePipe,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.getLeaveApplication()
    this.getleaveCatgeories();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.getLeaveApplication();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getLeaveApplication();
  }

  onClose(event: any) {
    if (event) {
      this.dialogRef.close(true);
    }
  }

  openStatusModal(report: any, status: string): void {
    report.status = status;
    this.leaveService.leave.next(report);
    const dialogRef = this.dialog.open(UpdateApplicationComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshLeaveApplicationTable(result);
    });
  }

  refreshLeaveApplicationTable(data: any) {
    data.totalLeaveDays = this.calculateTotalLeaveDays(data);
    this.leaveApplication.data.push(data);
    this.leaveApplication._updateChangeSubscription();
  }

  exportToCsv() {
    const dataToExport = this.leaveApplication.data;
    this.exportService.exportToCSV(
      this.translate.instant('leave.exportTitle'),
      this.translate.instant('leave.exportFilename'),
      dataToExport
    );
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '50%',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
    });
  }

  openSecondModal(selectedReport: any): void {
    this.leaveService.leave.next(selectedReport);
    this.dialogRef = this.dialog.open(ViewApplicationComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.getLeaveApplication();
    });
  }

  getleaveCatgeories() {
    const requestBody = { "skip": this.defaultCatSkip, "next": this.defaultCatNext };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe({
      next: (res: any) => {
        this.leaveCategories = res.data;
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingCategories'));
      }
    });
  }

  getCategory(categoryId: string) {
    const matchingCategory = this.leaveCategories?.find(category => category?._id === categoryId);
    return matchingCategory ? matchingCategory?.label : '';
  }

  trackByLeaveId(index: number, leave: any): string {
    return leave._id;
  }

  calculateTotalLeaveDays(leave: any) {
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const timeDifference = endDate.getTime() - startDate.getTime();
    let totalDays = Math.abs(Math.round(timeDifference / (1000 * 3600 * 24))) + 1;
    if (leave.isHalfDayOption) {
      if (startDate.toDateString() === endDate.toDateString()) {
        totalDays = 0.5;
      } else {
        totalDays -= 0.5;
      }
    }
    return totalDays;
  }

  getLeaveApplication() {
    const requestBody = {
      status: this.status,
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };

    if (this.portalView === 'admin') {
      this.leaveService.getLeaveApplication(requestBody).subscribe((res: any) => {
        this.leaveApplication.data = res.data;
        this.allData = res.data;
        this.totalRecords = res.total;
        this.leaveApplication.data = res.data.map((leave: any) => {
          leave.totalLeaveDays = this.calculateTotalLeaveDays(leave);
          return {
            ...leave,
            employee: leave.employee.firstName + ' ' + leave.employee.lastName,
            startDate: this.datePipe.transform(leave.startDate, 'MMM d, yyyy'),
            endDate: this.datePipe.transform(leave.endDate, 'MMM d, yyyy')
          };
        });
        this.allData = this.leaveApplication.data;
        return res;
      })
    }
    if (this.portalView === 'user' && this.tab === 1) {
      const employeeId = this.currentUser.id;
      this.leaveService.getLeaveApplicationbyUser(requestBody, employeeId).subscribe((res: any) => {
       this.leaveApplication.data = res.data;
        this.allData = res.data;
        this.totalRecords = res.total;
        this.leaveApplication.data = res.data.map((leave: any) => {
          leave.totalLeaveDays = this.calculateTotalLeaveDays(leave);
          return {
            ...leave,
            employee: leave.employee.firstName + ' ' + leave.employee.lastName,
            startDate: this.datePipe.transform(leave.startDate, 'MMM d, yyyy'),
            endDate: this.datePipe.transform(leave.endDate, 'MMM d, yyyy')
          };
        });
        this.allData = this.leaveApplication.data;
        return res;
      })
    }
    if (this.portalView === 'user' && this.tab === 5) {
      let payload = { skip: '', next: '' };
      return this.leaveService.getLeaveApplicationByTeam(payload).subscribe((res: any) => {
        this.leaveApplication.data = res.data.filter((leave: any) => leave.status === this.status);
        this.totalLeaveDays = 0;
        this.leaveApplication.data.forEach((leave: any) => {
          leave.totalLeaveDays = this.calculateTotalLeaveDays(leave);
        });
        this.allData = this.leaveApplication.data;
        return res;
      })
    }

    return of(null);
  }

  deleteLeaveApplication(_id: string) {
    this.leaveService.deleteLeaveApplication(_id).subscribe({
      next: (res: any) => {
        const index = this.leaveApplication.data.findIndex(temp => temp._id === _id);
        if (index !== -1) {
          this.leaveApplication.data.splice(index, 1);
          this.leaveApplication._updateChangeSubscription();
        }
        this.toast.success(this.translate.instant('leave.successDelete'));
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorDelete'));
      }
    });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteLeaveApplication(id);
      }
    });
  }

  checkForApproval(leavecategory: any) {
    return true;
  }

  // CHANGE: Added onSortChange to handle sorting
  onSortChange(event: any) {
    const sorted = this.leaveApplication.data.slice().sort((a: any, b: any) => {
      let valueA: any = '';
      let valueB: any = '';

      if (event.active === 'employee') {
        valueA = (a.employee.firstName)?.toLowerCase() || '';
        valueB = (b.employee.firstName)?.toLowerCase() || '';
      } else if (event.active === 'leaveCategory') {
        valueA = this.getCategory(a.leaveCategory)?.toLowerCase() || '';
        valueB = this.getCategory(b.leaveCategory)?.toLowerCase() || '';
      } else if (event.active === 'startDate' || event.active === 'endDate') {
        valueA = new Date(a[event.active]).getTime();
        valueB = new Date(b[event.active]).getTime();
      } else {
        valueA = a[event.active]?.toString().toLowerCase() || '';
        valueB = b[event.active]?.toString().toLowerCase() || '';
      }

      valueA = valueA ?? '';
      valueB = valueB ?? '';

      if (valueA < valueB) return event.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return event.direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.leaveApplication.data = sorted;
    this.leaveApplication._updateChangeSubscription();
  }

  onSearchChange(search: string) {
    const lowerSearch = search.toLowerCase();
    const data = this.allData.filter((row: any) => {
      const valuesToSearch = [
        row.employee?.toLowerCase(), ,
        this.getCategory(row.leaveCategory),
        this.datePipe.transform(row.startDate, 'mediumDate'),
        this.datePipe.transform(row.endDate, 'mediumDate'),
        row.totalLeaveDays?.toString(),
        row.status
      ];

      return valuesToSearch.some(value =>
        value?.toString().toLowerCase().includes(lowerSearch)
      );
    });

    this.leaveApplication.data = data;
    this.leaveApplication._updateChangeSubscription();
  }

  handleAction(event: any) {
    if (event.action.label === 'Approve') {
      this.openStatusModal(event.row, 'Approved');
    } else if (event.action.label === 'Reject') {
      this.openStatusModal(event.row, 'Rejected');
    } else if (event.action.label === 'Delete') {
      this.deleteDialog(event.row._id);
    } else if (event.action.label === 'View') {
      this.openSecondModal(event.row);
    }
  }
}