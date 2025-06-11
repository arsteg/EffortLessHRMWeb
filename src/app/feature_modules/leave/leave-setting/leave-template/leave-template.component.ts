import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LeaveService } from 'src/app/_services/leave.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';

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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        this.getLeaveTemplates();
      }
    );
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
      this.modalService.dismissAll();
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

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getLeaveTemplates();
  }
}