import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TableColumn, ActionVisibility } from 'src/app/models/table-column';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrl: './zone.component.css'
})
export class ZoneComponent {
    @ViewChild('addModal') addModal: ElementRef;
  zones = new MatTableDataSource([]);
  zoneForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedZone: any;
  public sortOrder: string = '';
  dialogRef: MatDialogRef<any> | null = null;
  totalRecords: number = 0;
  recordsPerPage: number =10;
  currentPage: number = 1;
  columns: TableColumn[] = [
      {
        key: 'startDate',
        name: this.translate.instant('organization.zone.table.start_date'),
        valueFn: (row: any)=> {return row.startDate ? this.datePipe.transform(row.startDate, 'mediumDate') : ''}
      }, {
        key: 'zoneCode',
        name: this.translate.instant('organization.zone.table.zone_code')
      },
      {
        key: 'zoneName',
        name: this.translate.instant('organization.zone.table.zone_name')
      },{
        key: 'description',
        name: this.translate.instant('organization.zone.table.description')
      },
      {
        key: 'status',
        name: this.translate.instant('organization.zone.table.status')
      },
      {
        key: 'action',
        name: this.translate.instant('organization.zone.table.action'),
        options: [
          {
            label: 'Edit',
            icon: 'edit',
            visibility: ActionVisibility.BOTH, // label | icon | both 
            cssClass: 'border-bottom',
          }, {
            label: 'Delete',
            icon: 'delete',
            visibility: ActionVisibility.BOTH,
            cssClass: 'text-danger'
          }
        ],
        isAction: true
      }
    ];

  constructor(private companyService: CompanyService,
    private datePipe: DatePipe,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private translate: TranslateService,
    private toast: ToastrService) {
    this.zoneForm = this.fb.group({
      startDate: ['', Validators.required],
      zoneCode: ['', Validators.required],
      zoneName: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.getZones();
  }

  onActionClick(event){
    switch (event.action.label) {
      case 'Edit':
        this.selectedZone = event.row; 
        this.isEdit= true;
        this.edit(event.row); 
        this.open(this.addModal)
        break;

      case 'Delete':
        this.deleteDialog(event.row?._id)
        break;
    }
  }

  getZones() {
    this.companyService.getZones().subscribe(res => {
      // this.zones.data = res.data;
      // this.totalRecords = this.zones.data.length;
      const data = Array.isArray(res.data) ? res.data : [];
      this.zones.data = [...data]; // Spread operator to ensure change detection
      this.totalRecords = data.length;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.zones.filter = filterValue.trim().toLowerCase();
    this.totalRecords = this.zones.filteredData.length;
  }

  onSubmission() {
    this.zoneForm.markAllAsTouched();
    if (this.zoneForm.invalid) {
      return;
    }
    // add zone
    if (!this.isEdit) {
      this.companyService.addZone(this.zoneForm.value).subscribe(res => {
        this.zones.data.push(res.data);
        this.toast.success(this.translate.instant('organization.zone.success.added'), this.translate.instant('organization.zone.success.title'));
        this.zoneForm.reset();
        this.dialogRef.close(true);
        this.getZones();
      },
        err => { 
          this.toast.error(err?.error?.message || err?.message || err || this.translate.instant('organization.zone.error.add_failed'), this.translate.instant('organization.zone.error.title'));
        }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateZone(this.selectedZone._id, this.zoneForm.value).subscribe(res => {
        this.toast.success(this.translate.instant('organization.zone.success.updated'), this.translate.instant('organization.zone.success.title'));
        const index = this.zones.data.findIndex(z => z._id === this.selectedZone._id);
        if (index !== -1) {
          this.zones.data[index] = { ...this.selectedZone, ...this.zoneForm.value };
        }
        this.zoneForm.reset();
        this.isEdit = false;
        this.zoneForm.get('zoneCode').enable();
        this.zoneForm.get('zoneName').enable();
        this.dialogRef.close(true);
        this.getZones();
      },
        err => { 
          this.toast.error(err?.error?.message || err?.message || err || this.translate.instant('organization.zone.error.update_failed'), this.translate.instant('organization.zone.error.title'));
        }
      );
    }
  }

  edit(data: any) {
    this.zoneForm.patchValue({
      startDate: data.startDate,
      zoneCode: data.zoneCode,
      zoneName: data.zoneName,
      description: data.description,
      status: data.status
    });
    this.zoneForm.get('zoneCode').disable();
    this.zoneForm.get('zoneName').disable();
  }

  clearselectedRequest() {
    const data = this.selectedZone;
    this.zoneForm.patchValue({
      startDate: data.startDate,
      zoneCode: data.zoneCode,
      zoneName: data.zoneName,
      description: data.description,
      status: data.status
    })
    this.zoneForm.get('zoneCode').disable();
    this.zoneForm.get('zoneName').disable();
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
    if (this.isEdit === false) {
      this.zoneForm.reset();
    }
    this.dialogRef = this.dialog.open(content, {
      disableClose: true,
      width: "50%"
    });

    this.dialogRef.afterClosed().subscribe(result => {
    });
  }

  deleteZone(id: string) {
    this.companyService.deleteZone(id).subscribe((res: any) => {
      this.getZones();
      this.toast.success(this.translate.instant('organization.zone.success.deleted'), this.translate.instant('organization.zone.success.title'));
    },
      (err) => {
        this.toast.error(err?.error?.message || err?.message || err || this.translate.instant('organization.zone.error.delete_failed'), this.translate.instant('organization.zone.error.title'));
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteZone(id);
      }
      err => {
        this.toast.error(err?.error?.message || err?.message || err || this.translate.instant('organization.zone.error.delete_failed'), this.translate.instant('organization.zone.error.title'));
      }
    });
  }

  onClose(){
    this.dialogRef.close(this);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getZones();
  }

  onSearchChange(searchText: string) {
    this.currentPage = 1;
    this.getZones();
  }

}
