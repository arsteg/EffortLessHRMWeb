import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { AssetType } from 'src/app/models/AssetsManagement/Asset';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

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

    constructor(private fb: FormBuilder,
       private toast: ToastrService,
       private assetManagementService: AssetManagementService,
       private dialog: MatDialog
       ) { }

    ngOnInit(): void {
        this.initTypeForm();
        this.getAllAssetTypes();
    }

    initTypeForm() {
      this.assetTypeForm = this.fb.group({
        _id: [null],
        typeName: ['', Validators.required],
        description: [''],
        customAttributes: this.fb.array([])
      });
    }

     // Getters for form controls
  get typeName() {
    return this.assetTypeForm.get('typeName');
  }

  get customAttributes() {
    return this.assetTypeForm.get('customAttributes') as FormArray;
  }

  // Add new CustomAttribute to the form
  addNewCustomAttribute() {
    const customAttributeGroup = this.fb.group({
      attributeName: ['', Validators.required],
      description: [''],
      dataType: ['', Validators.required],
      isRequired: [false]
    });
    this.customAttributes.push(customAttributeGroup);
  }

  // Remove CustomAttribute from the form
  removeCustomAttribute(index: number) {
    this.customAttributes.removeAt(index);
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
        this.assetManagementService.addCustomAttributes(response.data._id,this.assetTypeForm.value.customAttributes).subscribe(response => {
      });
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
      this.assetManagementService.updateAssetType(this.selectedAssetType._id, {typeName:this.assetTypeForm.value.typeName,description:this.assetTypeForm.value.description}).subscribe(response => {
        this.assetManagementService.deleteCustomAttributes(this.selectedAssetType._id).subscribe(response => {
          this.assetManagementService.addCustomAttributes(this.selectedAssetType._id,this.assetTypeForm.value.customAttributes).subscribe(response => {
            this.toast.success('Asset Type updated successfully!');
            this.getAllAssetTypes();
            this.isEdit = false;
            this.assetTypeForm.reset();
          });
        });
    });
    }

    deleteAssetType(assetType: AssetType) {
          this.assetManagementService.deleteAssetType(assetType._id).subscribe(response => {
              this.toast.success('Asset Type deleted successfully!');
              this.getAllAssetTypes();
          });
    }

    deleteCustomeAttribute(index: number) {
      this.customAttributes.removeAt(index);
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
  openDialog(assetType): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: assetType
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAssetType(assetType);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
}