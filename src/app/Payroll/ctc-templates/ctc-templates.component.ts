import { ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UpdateCTCTemplateComponent } from './update-ctctemplate/update-ctctemplate.component';

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
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  offcanvasData = 'Initial data';

  constructor(private modalService: NgbModal,
    private payroll: PayrollService,
    private toast: ToastrService,
    private dialog: MatDialog, private cdr: ChangeDetectorRef, private componentFactoryResolver: ComponentFactoryResolver) { }

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
    });
  }
  deleteRecord(_id: string) {
    this.payroll.deleteCTCTemplate(_id).subscribe((res: any) => {
      const index = this.ctcTemplate.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.ctcTemplate.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'CTC Template');
    },
      (err) => {
        this.toast.error('CTC Template can not be deleted', 'Error');
      })

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
  // openOffcanvas(offcanvasId: string) {
  //   this.showAssignedTemplates = true;
  //   const offcanvasElement = document.getElementById(offcanvasId);
  //   const offcanvas = new Offcanvas(offcanvasElement);
  //   offcanvas.show();
  // }

  // openOffcanvas(action: string) {
  //   console.log(this.selectedRecord);
  //   this.payroll.ctcTempData.next(this.selectedRecord);
  //   if (action === 'update') {
  //     this.showAssignedTemplates = false;
  //     const offcanvasElement = document.getElementById(action);
  //     const offcanvas = new Offcanvas(offcanvasElement);
  //     offcanvas.show();
  //     this.showAssignedTemplates = true;
  //     this.cdr.detectChanges();
  //   }
  // }
  showOffcanvas: boolean = false;

  openOffcanvas(isEdit: boolean, record: any = null) {
    this.isEdit = isEdit;
    this.selectedRecord = record;
    this.showOffcanvas = true;

    this.offcanvasContent.clear();

    // Create the component factory
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(UpdateCTCTemplateComponent);

    // Create the component and set the inputs
    const componentRef = this.offcanvasContent.createComponent(componentFactory);
    componentRef.instance.selectedRecord = this.selectedRecord;
    componentRef.instance.isEdit = this.isEdit;
  }

  closeOffcanvas() {
    this.showOffcanvas = false;
    this.isEdit = false;
    this.selectedRecord = null;
  }
  // openOffcanvas() {
  //   const componentFactory = this.componentFactoryResolver.resolveComponentFactory(UpdateCTCTemplateComponent);
  //   const componentRef = this.offcanvasContent.createComponent(componentFactory);
  //   componentRef.instance.selectedRecord = this.selectedRecord;
  //   componentRef.instance.isEdit = this.isEdit;
  // }
}
