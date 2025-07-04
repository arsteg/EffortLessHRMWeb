import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CompanyService } from 'src/app/_services/company.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  searchText: string = '';
  companyForm: FormGroup;
  isEdit: boolean = false;
  company: any;
  dataSource = new MatTableDataSource<any>();
  dialogRef: MatDialogRef<any>;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  fileError: string | null = null;
  logoPayload: any = null;

  @ViewChild('addEditCompanyDialog') addEditCompanyDialog: TemplateRef<any>;
  @ViewChild('uploadLogoDialog') uploadLogoDialog: TemplateRef<any>;
  columns: TableColumn[] = [
    {
      key: 'logo',
      name: 'Logo',
      isImage: true
    },
    {
      key: 'companyName',
      name: 'Company Name'
    },
    {
      key: 'contactPerson',
      name: 'Contact Person'
    },
    {
      key: 'email',
      name: 'Email'
    }, {
      key: 'phone',
      name: 'Phone'
    },
    {
      key: 'action',
      name: 'Actions',
      isAction: true,
      options: [
        {label: 'Edit', icon:'edit', visibility: ActionVisibility.BOTH},
        {label: 'Upload Logo', icon:'upload', visibility: ActionVisibility.BOTH},
      ]
    }
  ]
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private companyService: CompanyService,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      contactPerson: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      email: [{ value: '', disabled: true }, [Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  ngOnInit() {
    this.getCompany();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.openAddEditCompanyModal(event.row)
        break;

      case 'Upload Logo':
        this.openUploadLogoDialog(event.row)
        break;
    }
  }

  getCompany() {
    this.companyService.getCompany().subscribe((res: any) => {
      this.company = res.data?.company;
      this.dataSource.data = this.company ? [this.company] : [];
      if (this.company) {
        this.companyForm.patchValue(this.company);
      }
    });
  }

  onSubmission() {
    if (this.companyForm.valid) {
      console.log(this.companyForm.value);
      const serviceCall = this.companyService.updateCompany({ ...this.companyForm.value, id: this.company?.id })

      serviceCall.subscribe(() => {
        this.translate.get(this.isEdit ? 'organization.setup.company_updated' : 'organization.setup.company_added').subscribe((message: string) => {
          this.toast.success(message);
        });
        this.getCompany();
        this.dialogRef.close();
      }, (error) => {
        this.translate.get('organization.setup.company_update_failed').subscribe((message: string) => {
          this.toast.error(message);
        });
        console.error(error);
      });
    } else {
      this.markFormGroupTouched(this.companyForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  openAddEditCompanyModal(company?: any) {
    this.isEdit = !!company;
    if (this.isEdit) {
      this.companyForm.patchValue(company);
    } else {
      this.companyForm.reset();
    }
    this.dialogRef = this.dialog.open(this.addEditCompanyDialog, {
      width: '600px',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed:', result);
      this.clearSelectedRequest();
    });
  }

  openUploadLogoDialog(company: any) {
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileError = null;
    this.logoPayload = null;
    this.dialogRef = this.dialog.open(this.uploadLogoDialog, {
      width: '400px',
      data: { company }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('Upload dialog closed:', result);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        this.fileError = null;
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1]; // Get base64 without prefix
          const extension = file.name.split('.').pop()?.toLowerCase();

          this.logoPayload = {
            companyLogo: [
              {
                attachmentSize: file.size,
                extention: extension, // Keeping 'extention' as per provided format
                file: base64String
              }
            ]
          };
          this.imagePreview = reader.result as string; // Set preview
        };
        reader.readAsDataURL(file);
      } else {
        this.selectedFile = null;
        this.imagePreview = null;
        this.logoPayload = null;
        this.fileError = 'invalid_image_file';
      }
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
      this.logoPayload = null;
      this.fileError = 'no_file_selected';
    }
  }

  uploadLogo() {
    if (this.logoPayload) {
      this.companyService.updateCompanyLogo(this.logoPayload).subscribe(
        () => {
          this.translate.get('organization.setup.logo_uploaded').subscribe((message: string) => {
            this.toast.success(message);
          });
          this.getCompany();
          this.dialogRef.close();
        },
        (error) => {
          this.translate.get('organization.setup.logo_upload_failed').subscribe((message: string) => {
            this.toast.error(message);
          });
          console.error(error);
        }
      );
    } else {
      this.fileError = 'no_file_selected';
    }
  }

  clearSelectedRequest() {
    this.isEdit = false;
    this.companyForm.reset();
  }
}