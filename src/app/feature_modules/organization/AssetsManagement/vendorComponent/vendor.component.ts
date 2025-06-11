import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { Vendor } from 'src/app/models/AssetsManagement/Asset';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-vendor',
    templateUrl: './vendor.component.html',
    styleUrls: ['./vendor.component.css']
})
export class VendorComponent implements OnInit {
    vendors: Vendor[] = [];
    filteredVendors: Vendor[] = [];
    vendorForm: FormGroup;
    isEdit = false;
    selectedVendor: Vendor;
    p = 1;
    columns: TableColumn[] = [
        { key: 'vendorId', name: 'ID' },
        { key: 'vendorName', name: 'Name' },
        { key: 'email', name: 'Email' },
        { key: 'address', name: 'Address' },
        { key: 'phone', name: 'Phone' },
        {
            key: 'action', name: 'Action', isAction: true, options: [
                { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
                { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: 'text-danger' },
            ]
        }
    ]

    constructor(
        private fb: FormBuilder,
        private toast: ToastrService,
        private assetManagementService: AssetManagementService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.initVendorForm();
        this.getVendors();
    }

    onActionClick(event) {
        switch (event.action.label) {
            case 'Edit':
                this.editVendor(event.row)
                break;
            case 'Delete':
                this.openDialog(event.row)
                break;
        }
    }

    initVendorForm() {
        this.vendorForm = this.fb.group({
            vendorId: ['', Validators.required],
            vendorName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            address: [''],
            phone: ['']
        });
    }

    getVendors() {
        this.assetManagementService.getAllVendors().subscribe(response => {
            this.vendors = response.data;
            this.filteredVendors = this.vendors;
        });
    }

    filterVendors(query: any) {
        this.filteredVendors = this.vendors.filter(v => v.vendorName.toLowerCase().includes(query.target.value.toLowerCase()));
    }

    addVendor() {
        this.assetManagementService.addVendor(this.vendorForm.value).subscribe(response => {
            this.toast.success('Vendor added successfully!');
            this.getVendors();
            this.vendorForm.reset();
        });
    }

    editVendor(vendor: Vendor) {
        this.isEdit = true;
        this.selectedVendor = vendor;
        this.vendorForm.patchValue(vendor);
    }

    updateVendor() {
        this.assetManagementService.updateVendor(this.selectedVendor._id, this.vendorForm.value).subscribe(response => {
            this.toast.success('Vendor updated successfully!');
            this.getVendors();
            this.isEdit = false;
            this.vendorForm.reset();
        });
    }

    deleteVendor(vendor: Vendor) {

        this.assetManagementService.deleteVendor(vendor._id).subscribe(response => {
            this.toast.success('Vendor deleted successfully!');
            this.getVendors();
        });

    }

    openDialog(vendor): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: vendor
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'delete') {
                this.deleteVendor(vendor);
            }
            err => {
                this.toast.error('Can not be Deleted', 'Error!')
            }
        });
    }
}
