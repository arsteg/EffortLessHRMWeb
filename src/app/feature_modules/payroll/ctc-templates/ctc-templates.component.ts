import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-ctc-templates',
  templateUrl: './ctc-templates.component.html',
  styleUrls: ['./ctc-templates.component.css']
})
export class CtcTemplatesComponent implements OnInit {
  showTable = true;
  dataSource = new MatTableDataSource<any>();
  columns: TableColumn[] = [
    { key: 'templateName', name: 'Template Name' },
    { key: 'fixedAllowances', name: 'Fixed Allowances' },
    { key: 'fixedDeductions', name: 'Fixed Deductions' },
    { key: 'variableAllowances', name: 'Variable Allowances' },
    { key: 'variableDeductions', name: 'Variable Deductions' },
    {
      key: 'action',
      name: 'Actions',
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass:'delete-btn' }
      ]
    }
  ];
  paginator: any = {
    pageIndex: 0,
    pageSize: 10
  };
  totalRecords: number = 0;
  allData = [];
  isEdit: boolean = false;

  constructor(
    private payrollService: PayrollService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.loadCTCTemplates();
  }

  loadCTCTemplates() {
    const pagination = {
      skip: ((this.paginator?.pageIndex || 0) * (this.paginator?.pageSize || 10)).toString(),
      next: (this.paginator?.pageSize || 10).toString()
    };

    this.payrollService.getCTCTemplate(pagination).subscribe({
      next: (res: any) => {
        if (res?.data) {
          // Ensure data matches column keys
          this.dataSource.data = res.data.map((item: any) => ({
            ...item,
            templateName: item.name || 'Not Available',
            fixedAllowances: item.ctcTemplateFixedAllowances?.length || '--',
            fixedDeductions: item.ctcTemplateFixedDeductions?.length || '--',
            variableAllowances: item.ctcTemplateVariableAllowances?.length || '--',
            variableDeductions: item.ctcTemplateVariableDeductions?.length || '--'
          }));
          this.totalRecords = res.total;
          this.allData = structuredClone(this.dataSource.data);
        } else {
          this.dataSource.data = [];
          this.toast.warning('No data received from server');
        }
      },
      error: () => {
        this.dataSource.data = [];
        this.toast.error('Failed to load CTC templates');
      }
    });
  }

  handleAction(event: any) {
    if (event.action.label === 'Edit') {
      this.editTemplate(event.row);
    } 
    if (event.action.label === 'Delete') {
      this.deleteDialog(event.row._id);
    }
  }

  editTemplate(data: any) {
    this.payrollService.isEdit.next(true);
    this.payrollService.selectedCTCTemplate.next(data);
    this.payrollService.showTable.next(false);
    this.showTable = false;
    this.router.navigate([data._id], { relativeTo: this.route });
  }

  deleteDialog(id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }

  deleteRecord(id: string) {
    this.payrollService.deleteCTCTemplate(id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(item => item._id !== id);
        this.translate.get([
          'payroll._ctc_templates.toast.success_deleted',
          'payroll._ctc_templates.title'
        ]).subscribe(translations => {
          this.toast.success(
            translations['payroll._ctc_templates.toast.success_deleted'],
            translations['payroll._ctc_templates.title']
          );
        });
        this.loadCTCTemplates(); // Refresh data after deletion
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

  navigateToCreateTemplate() {
    this.payrollService.isEdit.next(false);
    this.payrollService.showTable.next(false);
    this.showTable = false;
    this.router.navigate(['create-ctc-template'], { relativeTo: this.route });
  }

  onPageChange(event: any) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.loadCTCTemplates();
  }

  onSortChange(event: any) {
    const sorted = this.dataSource.data.slice().sort((a, b) => {
      return event.direction === 'asc' ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
    });
    this.dataSource.data = sorted;
  }

  onSearchChange(event: any) {
    this.dataSource.data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(event.toLowerCase());
      });
      return found;
    }
    );
  }
}