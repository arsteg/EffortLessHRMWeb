import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { AssetType, CustomAttribute, UpdateCustomAttribute } from 'src/app/models/AssetsManagement/Asset';
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
  isEdit = false;
  selectedAssetType: any;
  p = 1;
  newCustomAttribute: any;


  constructor(private fb: FormBuilder,
    private toast: ToastrService,
    private assetManagementService: AssetManagementService,
    private dialog: MatDialog
  ) {
    this.selectedAssetType = {
      customAttributes: []
    };
  }

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


  addNewCustomAttribute() {
    const customAttributesArray = this.assetTypeForm.get('customAttributes') as FormArray;
    customAttributesArray.push(this.createCustomAttributeFormGroup());
  }

  createCustomAttributeFormGroup(): FormGroup {
    return this.fb.group({
      attributeName: ['', Validators.required],
      description: [''],
      dataType: ['', Validators.required],
      isRequired: [false]
    });
  }


  removeCustomAttribute(index: number) {
    const removedAttribute = this.selectedAssetType?.customAttributes[index];
    if (removedAttribute && removedAttribute._id) {
      const customAttributeId = removedAttribute._id;
      this.assetManagementService.deleteCustomAttributes(customAttributeId).subscribe(response => {
        if (this.selectedAssetType?.customAttributes) {
          this.selectedAssetType.customAttributes.splice(index, 1);
        }
        this.customAttributes.removeAt(index);
        this.toast.success('Custom Attribute is Deleted Successfully!');
      }, err => {
        this.toast.error('Can not be Deleted', 'Error!');
      });
    }
  }

  deleteCustomAttribute(index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.removeCustomAttribute(index);
      }
      err => {
      }
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

  
  addCustomAttributes() {

    const assetType = this.assetTypeForm.value;
    this.assetManagementService.addAssetType(assetType).subscribe((res: any) => {
      console.log('New Asset Type Created', res)
      this.getAllAssetTypes();
      this.toast.success('Asset Type added successfully!');
      assetType.reset();
    });
    
    if (this.selectedAssetType && this.selectedAssetType.customAttributes) {
      const existingCustomAttributes = this.selectedAssetType.customAttributes;

      const newCustomAttributes = this.assetTypeForm.value.customAttributes || [];
      const customAttributesToAdd = newCustomAttributes.filter((newAttribute) => {
        return !existingCustomAttributes.some((existingAttribute) => {
          return (
            existingAttribute.attributeName === newAttribute.attributeName &&
            existingAttribute.description === newAttribute.description &&
            existingAttribute.dataType === newAttribute.dataType &&
            existingAttribute.isRequired === newAttribute.isRequired
          );
        });
      });

      if (customAttributesToAdd.length > 0) {
        this.selectedAssetType.customAttributes.push(customAttributesToAdd[customAttributesToAdd.length - 1]);

        this.assetManagementService.addCustomAttributes(this.selectedAssetType._id || this.selectedAssetType[0].assetType, [customAttributesToAdd[customAttributesToAdd.length - 1]]).subscribe((response: any) => {
          this.newCustomAttribute = response && response.data;
          this.selectedAssetType.customAttributes = this.newCustomAttribute;
          this.getAllAssetTypes();
          this.toast.success('Custom Attribute added successfully!');
        });
      } (error) => {
        this.toast.error('No new custom attributes to add.');
      }
    }
  }



  editAssetType(assetType: AssetType) {
    this.isEdit = true;
    this.selectedAssetType = assetType;
    this.assetTypeForm.patchValue({
      typeName: assetType.typeName,
      description: assetType.description
    });
    this.customAttributes.clear();
    // Populate customAttributes FormArray without clearing it
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

  updateCustomAttribute(index: number) {
    const customAttribute = this.selectedAssetType.customAttributes[index];
    const customAttributeId = customAttribute._id;
    const customAttributesArray = this.assetTypeForm.get('customAttributes') as FormArray;
    const customAttributeFormGroup = customAttributesArray.at(index);

    const attributeName = customAttributeFormGroup.get('attributeName').value;
    const description = customAttributeFormGroup.get('description').value;
    const dataType = customAttributeFormGroup.get('dataType').value;
    const isRequired = customAttributeFormGroup.get('isRequired').value;

    const updatedAttribute: UpdateCustomAttribute = {
      attributeName: attributeName,
      dataType: dataType,
      description: description,
      isRequired: isRequired
    };

    this.assetManagementService.updateCustomAttribute(customAttributeId, updatedAttribute).subscribe(
      (response) => {
        // Update the form control values with the updated data
        customAttribute.attributeName = attributeName;
        customAttribute.description = description;
        customAttribute.dataType = dataType;
        customAttribute.isRequired = isRequired;
        this.toast.success('Custom Attribute updated successfully!');
        this.getAllAssetTypes();
      },
      (error) => {
        this.toast.error('Error updating custom attribute', 'Error!');
      }
    );
  }


  deleteAssetType(assetType) {
    this.assetManagementService.deleteAssetType(assetType._id).subscribe(response => {
      this.toast.success('Asset Type deleted successfully!');
      this.getAllAssetTypes();

    });
    (error)=>{
    this.toast.error('Asset Type Cannot be Deleted!');
    }
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