import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  countryName = '';
  selectedCountryCode: string;
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
    { key: 'locationCode', name: 'Location Code' },
    { key: 'country', name: 'Country' },
    { key: 'state', name: 'State' },
    { key: 'city', name: 'City' },
    { key: 'organization', name: 'Organization' },
    { key: 'providentFundRegistrationCode', name: 'PF Reg. Code' },
    { key: 'esicRegistrationCode', name: 'ESIC Reg. Code' },
    { key: 'professionalTaxRegistrationCode', name: 'Professional Tax Reg. Code' },
    { key: 'lwfRegistrationCode', name: 'LWF Reg. Code' },
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
    private http: HttpClient) {
    this.locationForm = this.fb.group({
      locationCode: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      organization: ['', Validators.required],
      providentFundRegistrationCode: [''],
      esicRegistrationCode: [''],
      professionalTaxRegistrationCode: [''],
      lwfRegistrationCode: [''],
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
      this.locations = res.data;
    });
  }

  onSubmission() {
    // add Location
    if (!this.isEdit) {
      this.companyService.addLocation(this.locationForm.value).subscribe(res => {
        this.locations.push(res.data);
        this.toast.success('Location added successfully', 'Success');
        this.locationForm.reset();
      },
        err => { this.toast.error('Location Can not be Added', 'Error') }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateLocation(this.selectedZone._id, this.locationForm.value).subscribe(res => {
        this.toast.success('Location updated successfully', 'Success');
        const index = this.locations.findIndex(z => z._id === this.selectedZone._id);
        if (index !== -1) {
          this.locations[index] = { ...this.selectedZone, ...this.locationForm.value };
        }
        this.locationForm.reset();
        this.isEdit = false;
        this.locationForm.get('locationCode').enable();

      },
        err => { this.toast.error('Location Can not be Updated', 'Error') }
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

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteLocation(id: string) {
    this.companyService.deleteLocation(id).subscribe((res: any) => {
      this.getLocations();
      this.toast.success('Successfully Deleted!!!', 'Location')
    },
      (err) => {
        this.toast.error('This Location Can not be deleted!', 'Error')
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
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

}