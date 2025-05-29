import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ctc-templates',
  templateUrl: './ctc-templates.component.html',
  styleUrls: ['./ctc-templates.component.css']
})
export class CtcTemplatesComponent implements OnInit, AfterViewInit {
  isEdit: boolean = false;
  selectedRecord: any;
  showAssignedTemplates: boolean = false;
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  showTable: boolean = true;
  displayedColumns: string[] = ['name', 'fixedAllowances', 'fixedDeductions', 'otherAllowances', 'actions'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private payroll: PayrollService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    public tableService: TableService<any>,
    private translate: TranslateService
  ) {
    // Set custom filter predicate to search by name
    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      return data.name.toLowerCase().includes(filter.toLowerCase());
    });
  }

  ngOnInit() {
    this.getCTCTemplate();
  }

  ngAfterViewInit() {
    this.tableService.initializeDataSource([], this.paginator);
    this.getCTCTemplate();
  }

  getCTCTemplate() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.payroll.getCTCTemplate(pagination).subscribe(data => {
      this.tableService.setData(data.data);
      this.tableService.totalRecords = data.total;
    });
  }

  deleteRecord(_id: string) {
    this.payroll.deleteCTCTemplate(_id).subscribe({
      next: (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.translate.get([
          'payroll._ctc_templates.toast.success_deleted',
          'payroll._ctc_templates.title'
        ]).subscribe(translations => {
          this.toast.success(
            translations['payroll._ctc_templates.toast.success_deleted'],
            translations['payroll._ctc_templates.title']
          );
        });
      },
      error: (err) => {
        this.translate.get('payroll._ctc_templates.title').subscribe(title => {
          this.toast.error(
            err?.error?.message || this.translate.instant('payroll._ctc_templates.toast.error_delete'),
            title
          );
        });
      }
    });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }

  getComponentsDetail(data: any) {
    this.isEdit = true;
    this.payroll.isEdit.next(true);
    this.payroll.selectedCTCTemplate.next(data);
    this.payroll.showTable.next(false);
    this.payroll.showAssignedTemplate.next(true);
    this.showTable = false;
    this.router.navigate([`update-ctc-template`, data._id], { relativeTo: this.route });
  }

  navigateToUpdateCTCTemplate() {
    this.payroll.isEdit.next(false);
    this.payroll.showTable.next(false);
    this.payroll.showAssignedTemplate.next(true);
    this.showTable = false;
    this.router.navigate(['home/payroll/ctc-template/create-ctc-template']);
  }

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getCTCTemplate();
  }
}