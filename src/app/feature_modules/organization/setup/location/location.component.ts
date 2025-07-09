import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Action } from 'rxjs/internal/scheduler/Action';
import { CommonService } from 'src/app/_services/common.Service';
import { CompanyService } from 'src/app/_services/company.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})

export class LocationComponent {
  @ViewChild('addModal') addModal: ElementRef;
  locations: any;
  locationForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedZone: any;
  isSubmitting: boolean = false;
  countryName = '';
  selectedCountryCode: string;
  dialogRef: MatDialogRef<any> | null = null;
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];
  public sortOrder: string = '';

  columns: TableColumn[] = [
    { key: 'locationCode', name: this.translate.instant('organization.location.table.location_code') },
    { key: 'country', name: this.translate.instant('organization.location.table.country') },
    { key: 'state', name: this.translate.instant('organization.location.table.state') },
    { key: 'city', name: this.translate.instant('organization.location.table.city') },
    { key: 'organization', name: this.translate.instant('organization.location.table.organization') },
    { key: 'providentFundRegistrationCode', name: this.translate.instant('organization.location.table.pf_registration_code') },
    { key: 'esicRegistrationCode', name: this.translate.instant('organization.location.table.esic_registration_code') },
    { key: 'professionalTaxRegistrationCode', name: this.translate.instant('organization.location.table.pt_registration_code') },
    { key: 'lwfRegistrationCode', name: this.translate.instant('organization.location.table.lwf_registration_code') },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        {
          label: 'Edit',
          icon: 'edit',
          visibility: ActionVisibility.BOTH,
        },
        {
          label: 'Delete',
          icon: 'delete',
          visibility: ActionVisibility.BOTH,
          cssClass: 'text-danger'
        }
      ]
    },

  ]

  constructor(private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private translate: TranslateService,
    private http: HttpClient) {
    this.locationForm = this.fb.group({
      locationCode: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      organization: ['', Validators.required],
      providentFundRegistrationCode: ['', [Validators.pattern(/^[A-Z]{2}\/\d{5}$/)]],  // Example: TN/12345
      esicRegistrationCode: ['', [Validators.pattern(/^\d{17}$/)]],  // Example: 17-digit ESIC number
      professionalTaxRegistrationCode: ['', [Validators.pattern(/^[A-Z]{2}\/PT\/\d{5}$/)]],  // Example: MH/PT/12345
      lwfRegistrationCode: ['', [Validators.pattern(/^[A-Z]{2}\/LWF\/\d{4}$/)]],  // Example: KA/LWF/1234    
      taxDeclarationApprovers: [['']]
    });
  }

  ngOnInit() {
    this.getLocations();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.selectedZone = event.row;
        this.isEdit = true;
        this.edit(event.row);
        this.open(this.addModal);
        break;

      case 'Delete':
        this.deleteDialog(event.row?._id)
        break;
    }
  }

  getLocations() {
    this.companyService.getLocations().subscribe(res => {
      //this.locations = res.data;
      const data = Array.isArray(res.data) ? res.data : [];
      this.locations = [...data]; // Spread operator to ensure change detection
      this.totalRecords = data.length;
    });
  }

  onSubmission() {
    this.isSubmitting = true;

    this.locationForm.markAllAsTouched();
  
    if (this.locationForm.invalid) {
      this.isSubmitting = false;
      return;
    }
    // add Location
    if (!this.isEdit) {
      this.companyService.addLocation(this.locationForm.value).subscribe(res => {
        this.getLocations();
        this.toast.success(this.translate.instant('organization.setup.location_added'), this.translate.instant('organization.toast.success'));
        this.isSubmitting = false;
        this.locationForm.reset();
        this.dialogRef.close(true);
      },
      err => { const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.location_add_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
        this.isSubmitting = false;
      }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateLocation(this.selectedZone._id, this.locationForm.value).subscribe(res => {
        this.toast.success(this.translate.instant('organization.setup.location_updated'), this.translate.instant('organization.toast.success'));
        this.getLocations();
        this.locationForm.reset();
        this.isEdit = false;
        this.isSubmitting = false;
        this.locationForm.get('locationCode').enable();
        this.dialogRef.close(true);

      },
      err => { const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.location_add_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
        this.isSubmitting = false;
      }
      );
    }
  }

  edit(data: any) {
    this.locationForm.patchValue({
      locationCode: data.locationCode,
      country: data.country,
      state: data.state,
      city: data.city,
      organization: data.organization,
      providentFundRegistrationCode: data.providentFundRegistrationCode,
      esicRegistrationCode: data.esicRegistrationCode,
      professionalTaxRegistrationCode: data.professionalTaxRegistrationCode,
      lwfRegistrationCode: data.lwfRegistrationCode,
      taxDeclarationApprovers: data.taxDeclarationApprovers
    });
    this.locationForm.get('locationCode').disable();
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.locationForm.get('locationCode').enable();
    this.locationForm.reset();
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

    this.dialogRef = this.dialog.open(content, {
      disableClose: true,
      width: '50%'
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
    });
  }
  

  deleteLocation(id: string) {
    this.companyService.deleteLocation(id).subscribe((res: any) => {
      this.getLocations();
      this.toast.success(this.translate.instant('organization.setup.location_deleted'), this.translate.instant('toast.success'));
   
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.location_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteLocation(id);
      }
      err => {
        this.toast.error(this.translate.instant('organization.setup.location_delete_fail'));
      }
    });
  }

  onClose(){
    this.locationForm.reset();
    this.dialogRef.close(true);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getLocations();
  }

  onSearchChange(searchText: string) {
    this.currentPage = 1;
    this.getLocations();
  }
}