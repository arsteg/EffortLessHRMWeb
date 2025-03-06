import { ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UpdateCTCTemplateComponent } from './update-ctctemplate/update-ctctemplate.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDrawer } from '@angular/material/sidenav';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ctc-templates',
  templateUrl: './ctc-templates.component.html',
  styleUrl: './ctc-templates.component.css'
})
export class CtcTemplatesComponent {
  ctcTemplate: any;
  searchText: string = '';
  closeResult: string = '';
  selectedRecord: any;
  showAssignedTemplates = false;
  isEdit: boolean = false;
  @ViewChild('offcanvasContent', { read: ViewContainerRef }) offcanvasContent: ViewContainerRef;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  offcanvasData = 'Initial data';
  showOffcanvas: boolean = false;
  public sortOrder: string = '';
  displayedColumns: string[] = ['name', 'fixedAllowances', 'fixedDeductions', 'otherAllowances', 'actions'];
  dataSource: MatTableDataSource<any>;
  showTable: boolean = true;

  constructor(private modalService: NgbModal,
    private payroll: PayrollService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getCTCTemplate();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getCTCTemplate();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getCTCTemplate();
  }

  getCTCTemplate() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getCTCTemplate(pagination).subscribe(data => {
      this.ctcTemplate = data.data;
      this.totalRecords = data.total;
      this.dataSource = new MatTableDataSource(this.ctcTemplate);
    });
  }

  deleteRecord(_id: string) {
    this.payroll.deleteCTCTemplate(_id).subscribe((res: any) => {
      const index = this.ctcTemplate.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.ctcTemplate.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'CTC Template');
    }, (err) => {
      this.toast.error('CTC Template can not be deleted', 'Error');
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

  handleRecordUpdate(updatedRecord: any) {
    this.getCTCTemplate();
    this.cdr.detectChanges();
  }

  getComponentsDetail(data: any) {
    this.isEdit = true;
    this.payroll.isEdit.next(true);
    this.payroll.selectedCTCTemplate.next(data);
    this.payroll.showTable.next(this.showTable);
    this.payroll.showAssignedTemplate.next(true);
    this.router.navigate([`update-ctc-template`, data._id], { relativeTo: this.route });
  }

  navigateToUpdateCTCTemplate() {
    this.payroll.isEdit.next(false);
    this.payroll.showTable.next(false);
    // this.payroll.selectedCTCTemplate.next();
    this.payroll.showAssignedTemplate.next(true);
    this.router.navigate(['home/payroll/ctc-template/create-ctc-template']);
  }
}