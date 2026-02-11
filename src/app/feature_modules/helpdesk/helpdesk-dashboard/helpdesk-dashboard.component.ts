import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { HelpdeskService } from 'src/app/_services/helpdeskService';
import { HelpDeskComponent } from '../help-desk/help-desk.component';
import { UpdateHelpdeskTaskComponent } from '../update-helpdesk-task/update-helpdesk-task.component';
import { MatSort } from '@angular/material/sort';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-helpdesk-dashboard',
  templateUrl: './helpdesk-dashboard.component.html',
  styleUrl: './helpdesk-dashboard.component.css'
})
export class HelpdeskDashboardComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  closeResult: string = '';
  helpdeskData = new MatTableDataSource<any>();
  addCategoryForm: FormGroup;
  isEdit = false;
  selectedField: any;
  selectedCategory: any;
  field: any = []
  updatedCategory: any;
  originalFields: any[] = [];
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  displayedColumns: string[] = ['createdOn', 'description', 'files', 'video', 'status', 'remarks', 'actions'];
  dialogRef: MatDialogRef<any>;
  allData: any[] = [];
  expenseTypes = {
    perDay: 'Per Day',
    time: 'Time',
    distance: 'Distance',
    dateRange: 'Date Range',
    other: 'Other'
  }
  isAdminView = false;
  columns: TableColumn[] = [
    { 
      key: 'createdOn', name: this.translate.instant('helpdesk.date'),
      valueFn: (row: any) => new Date(row.createdOn).toLocaleDateString() 
    },
    { key: 'description', name: this.translate.instant('helpdesk.description') },
    { key: 'files', 
      name: this.translate.instant('helpdesk.files'),
      isHtml: true,
      valueFn: (row: any) => {
        if (row.files) {
          return row.files.split(',').map((file: string, index: number) => 
            `<a href="${file.trim()}" target="_blank">File ${index + 1}</a>`
          ).join(', ');
        }
        return '';
      } 
    },
    { 
      key: 'video', 
      name: this.translate.instant('helpdesk.videos'),
      isHtml: true,
      valueFn: (row: any) => {
        if (row.video) {
          return row.video.split(',').map((video: string, index: number) => 
            `<a href="${video.trim()}" target="_blank">Video ${index + 1}</a>`
          ).join(', ');
        }
        return '';
      }
    },
    { key: 'status', name: this.translate.instant('helpdesk.status') },
    { key: 'remarks', name: this.translate.instant('helpdesk.remarks') },
    {
      key: 'action',
      name: this.translate.instant('helpdesk.actions'),
      isAction: true,
      options: [
        { label: 'Update', icon: 'edit', visibility: ActionVisibility.LABEL, hideCondition: (row: any) => !this.isAdminView },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL, hideCondition: (row: any) => this.isAdminView }
      ]
    }
  ];
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private helpdeskService: HelpdeskService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.addCategoryForm = this.fb.group({
      type: ['', Validators.required],
      label: ['', Validators.required],
      isMandatory: ['', Validators.required],
      expenseCategory: [''],
      fields: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.getAllHelpdeskData();

    this.helpdeskData.filterPredicate = (data: any, filter: string) => {
      const dataStr = Object.values(data).join(' ').toLowerCase();
      return dataStr.includes(filter);
    };

    this.isAdminView = localStorage.getItem('adminView') == 'admin';
  }

  ngAfterViewInit() {
    this.helpdeskData.sort = this.sort;
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getAllHelpdeskData();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.helpdeskData.filter = filterValue.trim().toLowerCase();
  
    if (this.helpdeskData.paginator) {
      this.helpdeskData.paginator.firstPage();
    }
  }

  getAllHelpdeskData() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.helpdeskService.getAllHelpdeskByUser(pagination).subscribe((res: any) => {
      this.helpdeskData.data = res.data;
      console.log('Helpdesk Data:', this.helpdeskData.data);
      this.totalRecords = res.total;
      this.allData = res.data;
    });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteHelpdesk(id);
      }
      err => {
        this.toast.error(err || this.translate.instant('helpdesk.delete_error'))
      }
    });
  }

  deleteHelpdesk(id: string) {
    this.helpdeskService.deleteHelpdeskById(id).subscribe((res: any) => {
      this.getAllHelpdeskData();
      this.toast.success(this.translate.instant('helpdesk.delete_success'));
    },
      (err) => {
        this.toast.error(err || this.translate.instant('helpdesk.delete_error'));
      })
  }

  toggleHelpdesk(): void {
      const dialogRef = this.dialog.open(HelpDeskComponent, {
        width: '90vw',
        maxWidth: '700px',
        height: 'auto',
        maxHeight: '90vh',
        disableClose: false,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result?.success) {
          this.getAllHelpdeskData(); // Refresh the list
        }
      });
    }

    openUpdateDialog(helpdesk: any): void {
      const dialogRef = this.dialog.open(UpdateHelpdeskTaskComponent, {
        width: '50%',
        data: { helpdesk }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.updateHelpdesk(helpdesk._id, result.status, result.remark);
        }
      });
    }
    
    updateHelpdesk(id: string, status: string, remark: string) {
      this.helpdeskService.updateHelpdeskTicket(id, { status, remark }).subscribe(() => {
        this.getAllHelpdeskData();
      });
    }

    handleAction(event: any) {
      if (event.action.label === 'Update') {
        this.openUpdateDialog(event.row);
      }
      if (event.action.label === 'Delete') {
        this.deleteDialog(event.row._id);
      }
    }

  onSortChange(event: any) {
    const sorted = this.helpdeskData.data.slice().sort((a: any, b: any) => {
      const valueA = a[event.active];
      const valueB = b[event.active];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.helpdeskData.data = sorted;
  }

  onSearchChange(event: any) {
    this.helpdeskData.data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(event.toLowerCase());
      });
      return found;
    }
    );
  }
}
