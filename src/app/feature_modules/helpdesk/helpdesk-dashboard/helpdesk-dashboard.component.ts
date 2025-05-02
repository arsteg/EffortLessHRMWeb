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
  expenseTypes = {
    perDay: 'Per Day',
    time: 'Time',
    distance: 'Distance',
    dateRange: 'Date Range',
    other: 'Other'
  }
  isAdminView = false;
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
      this.dialog.open(HelpDeskComponent, {
        width: '90vw',
        maxWidth: '700px',
        height: 'auto',
        maxHeight: '90vh',
        disableClose: false,
      });
    }

    openUpdateDialog(helpdesk: any): void {
      const dialogRef = this.dialog.open(UpdateHelpdeskTaskComponent, {
        width: '400px',
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
}
