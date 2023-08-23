import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { Vendor } from 'src/app/models/AssetsManagement/Asset';

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

    constructor(private fb: FormBuilder, private toast: ToastrService, private assetManagementService: AssetManagementService) { }

    ngOnInit(): void {
        this.initVendorForm();
        this.getVendors();
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
        const result = window.confirm('Are you sure you want to delete this vendor?');
        if (result) {
            this.assetManagementService.deleteVendor(vendor._id).subscribe(response => {
                this.toast.success('Vendor deleted successfully!');
                this.getVendors();
            });
        }
    }
}
