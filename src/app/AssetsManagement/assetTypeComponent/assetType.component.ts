import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    isEdit =false;
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
          description: ['', Validators.required],
          customAttributes: this.fb.array([])  // Ensure this line is there.
      });

    }

    getAllAssetTypes() {
      this.assetManagementService.getAllAssetTypes().subscribe(response => {
        this.assetTypes = response.data;
        this.filteredAssetTypes = this.assetTypes;
    });
    }

    filterAssetTypes(query: any) {
      this.filteredAssetTypes = this.assetTypes.filter(v => v.description.toLowerCase().includes(query.target.value.toLowerCase()));
    }

    addassetType() {
      this.assetManagementService.addAssetType(this.assetTypeForm.value).subscribe(response => {
        this.toast.success('Asset Type added successfully!');
        this.getAllAssetTypes();
        this.assetTypeForm.reset();
    });
    }


    editAssetType(assetType: AssetType) {
      this.isEdit = true;
      this.selectedAssetType = assetType;
      this.assetTypeForm.patchValue({
          typeName: assetType.typeName,
          description: assetType.description
      });

      // Clear the existing customAttributes
      this.customAttributes.clear();

      // Populate customAttributes FormArray
      assetType.customAttributes.forEach(attr => {
          const attribute = this.fb.group({
              attributeName: [attr.attributeName, Validators.required],
              description: [attr.description, Validators.required],
              dataType: [attr.dataType, Validators.required],
              isRequired: [attr.isRequired]
          });
          this.customAttributes.push(attribute);
      });
  }


    viewAssetType(assetType: AssetType) {
      this.selectedAssetType = assetType;
      //this.assetTypeForm.patchValue(assetType);
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
          this.assetManagementService.deleteAssetType(assetType._id).subscribe(response => {
              this.toast.success('Asset Type deleted successfully!');
              this.getAllAssetTypes();
          });
      }
    }

    deleteCustomeAttribute(index: number) {
      this.customAttributes.removeAt(index);
    }

    // FormArray for customAttributes
  get customAttributes(): FormArray {
    return this.assetTypeForm.get('customAttributes') as FormArray;
  }

    addCustomAttribute(): void {
      const attribute = this.fb.group({
          attributeName: ['', Validators.required],
          description: ['', Validators.required],
          dataType: ['', Validators.required],
          isRequired: [false]
      });
      this.customAttributes.push(attribute);
  }
}
