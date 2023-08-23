import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { AssetType } from 'src/app/models/AssetsManagement/Asset';

@Component({
  selector: 'app-asset-type',
  templateUrl: './assetType.component.html',
  styleUrls: ['./assetType.component.css']
})
export class AssetTypeComponent implements OnInit {
    assetTypes: AssetType[] = [];
    filteredAssetTypes: AssetType[] = [];
    assetTypeForm: FormGroup;
    isEdit = false;
    selectedAssetType: AssetType;
    p = 1;

    constructor(private fb: FormBuilder, private toast: ToastrService,private assetManagementService: AssetManagementService) { }

    ngOnInit(): void {
        this.initTypeForm();
        this.getAllAssetTypes();
    }

    initTypeForm() {
        this.assetTypeForm = this.fb.group({
            typeName: ['', Validators.required],
            description: ['', Validators.required]
            // Add form controls for custom attributes here
        });
    }

    getAllAssetTypes() {
      this.assetManagementService.getAllVendors().subscribe(response => {
        this.assetTypes = response.data;
        this.filteredAssetTypes = this.assetTypes;
    });
    }

    filterAssetTypes(query: any) {
      this.filteredAssetTypes = this.assetTypes.filter(v => v.description.toLowerCase().includes(query.target.value.toLowerCase()));
    }

    addassetType() {
      this.assetManagementService.addVendor(this.assetTypeForm.value).subscribe(response => {
        this.toast.success('Vendor added successfully!');
        this.getAllAssetTypes();
        this.assetTypeForm.reset();
    });
    }

    editAssetType(assetType: AssetType) {
      this.isEdit = true;
      this.selectedAssetType = assetType;
      this.assetTypeForm.patchValue(assetType);
    }

    updateAssetType() {
      this.assetManagementService.updateVendor(this.selectedAssetType._id, this.assetTypeForm.value).subscribe(response => {
        this.toast.success('Vendor updated successfully!');
        this.getAllAssetTypes();
        this.isEdit = false;
        this.assetTypeForm.reset();
    });
    }

    deleteAssetType(assetType: AssetType) {
      const result = window.confirm('Are you sure you want to delete this Asset Type?');
      if (result) {
          this.assetManagementService.deleteVendor(assetType._id).subscribe(response => {
              this.toast.success('Asset Type deleted successfully!');
              this.getAllAssetTypes();
          });
      }
    }
}
