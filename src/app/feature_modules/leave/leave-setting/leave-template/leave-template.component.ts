import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LeaveService } from 'src/app/_services/leave.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-leave-template',
  templateUrl: './leave-template.component.html',
  styleUrls: ['./leave-template.component.css']
})
export class LeaveTemplateComponent implements OnInit, AfterViewInit {
  closeResult: string = '';
  changeMode: 'Add' | 'Next' = 'Add';
  step: number = 1;
  selectedTemplate: any;
  isEdit: boolean = false;
  displayedColumns: string[] = ['label', 'numberOfEmployeesCovered', 'numberOfLeaveCategories', 'actions'];
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100];
  @Output() LeaveTableRefreshed: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  allData: any[] = [];
  dialogRef: MatDialogRef<any> | null = null;

  columns: TableColumn[] = [
    { 
      key: 'label', 
      name: 'Leave Label' 
    },
    { 
      key: 'numberOfEmployeesCovered', 
      name: 'Number Of Employees Covered',
      valueFn: (row: any) => this.calculateTotalEmployees(row)
    },
    { 
      key: 'numberOfLeaveCategories', 
      name: 'Number Of Leave Categories',
      valueFn: (row: any) => row?.applicableCategories?.length
    },
    {
      key: 'actions',
      name: 'Action',
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  constructor(
    private modalService: NgbModal,
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private translate: TranslateService,
    public tableService: TableService<any>
  ) {
    this.initializeFilterPredicate();
  }

  ngOnInit(): void {
    this.getLeaveTemplates();
  }

  ngAfterViewInit() {
    this.tableService.dataSource.paginator = this.paginator;
    this.getLeaveTemplates();
  }

  initializeFilterPredicate() {
    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      const searchString = filter.trim().toLowerCase();
      const label = data.label?.toLowerCase() || '';
      const employeesCovered = this.calculateTotalEmployees(data)?.toString().toLowerCase() || '';
      const leaveCategories = (data.applicableCategories?.length || 0).toString();
      return label.includes(searchString) ||
             employeesCovered.includes(searchString) ||
             leaveCategories.includes(searchString);
    });
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '50%',
      disableClose: true
    });
    this.dialogRef.afterClosed().subscribe(result => {
    });
  }

  setFormValues(templateData: any) {
    this.leaveService.selectedTemplate.next(templateData);
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

  onChangeStep(event: number) {
    this.step = event;
  }

  onClose(event: boolean) {
    if (event) {
      this.dialogRef.close(true);
    }
  }

  refreshLeaveTemplateTable() {
    const requestBody = { skip: '0', next: '100000' };
    this.leaveService.getLeavetemplates(requestBody).subscribe({
      next: (res: any) => {
        this.getLeaveTemplates();
      },
      error: (error) => {
        console.error('Error refreshing leave template table:', error);
      }
    });
  }

  getLeaveTemplates() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.leaveService.getLeavetemplates(pagination).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.tableService.setData(res.data || []);
          this.allData = res.data;
          this.tableService.totalRecords = res.total || 0;
        }
      },
      error: (err) => {
        console.error('Error fetching leave templates:', err);
        this.tableService.setData([]);
        this.tableService.totalRecords = 0;
      }
    });
  }

  deleteTemplate(_id: string) {
    this.leaveService.deleteTemplate(_id).subscribe({
      next: (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(this.translate.instant('leave.template.successDeleted'), this.translate.instant('leave.template.title'));
      },
      error: (err) => {
        this.toast.error(this.translate.instant('leave.template.errorCannotDelete'), this.translate.instant('leave.template.title'));
      }
    });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }

  clearRequest() {
    if (this.changeMode === 'Add') {
      this.isEdit = true;
    }
  }

 calculateTotalEmployees(leaveTemp: any) {
  if (!leaveTemp || !leaveTemp.applicableCategories || !Array.isArray(leaveTemp.applicableCategories)) {
    return 0;
  }
    let totalEmployees: any;
    for (const category of leaveTemp?.applicableCategories) {
      if (!category?.templateApplicableCategoryEmployee.length) {
        totalEmployees = 'All Employees';
      } else {
        totalEmployees = category?.templateApplicableCategoryEmployee.length;
      }
    }
    return totalEmployees;
  }

  handleAction(event: any, addModal: any) {
    if (event.action.label === 'Edit') {
      this.changeMode='Next'; 
      this.isEdit = true; 
      this.selectedTemplate= event?.row; 
      this.setFormValues(event?.row); 
      this.open(addModal);
    } 
    if (event.action.label === 'Delete') {
      this.deleteDialog(event.row._id);
    }
  }

  onPageChange(event: any) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.getLeaveTemplates();
  }

  onSortChange(event: any) {
    const sorted = this.tableService.dataSource.data.slice().sort((a: any, b: any) => {
      const valueA = a[event.active];
      const valueB = b[event.active];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.tableService.dataSource.data = sorted;
  }

  onSearchChange(event: any) {
    this.tableService.dataSource.data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        if (col.key !== 'actions') {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(event.toLowerCase());
        }
        return false;
      });
      return found;
    });
  }
}