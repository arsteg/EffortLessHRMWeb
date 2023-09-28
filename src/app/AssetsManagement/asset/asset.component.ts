import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import {
  Asset,
  AssetAttributeValue,
  AssetStatus,
  AssetType,
  CustomAttribute,
} from 'src/app/models/AssetsManagement/Asset';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.css'],
})
export class AssetComponent implements OnInit {
  assetTypes: AssetType[] = [];
  assetStatuses: AssetStatus[] = [];
  gridHeadings: string[];
  selectedAssetType: string = '';
  selectedAssetTypeName: string = '';
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  selectedAssetTypeCustomAttributes: CustomAttribute[] = [];
  assetForm: FormGroup;
  isEdit = false;
  selectedAsset: Asset;
  selectedCustomAttributes: CustomAttribute[] = [];
  p = 1;
  searchText: string = '';

  constructor(
    private fb: FormBuilder,
    private assetService: AssetManagementService,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAssetTypes();
    this.initAssetForm();
    this.getAssetStatusList();
    this.assetForm.statusChanges.subscribe((f)=>{
      console.log(this.assetForm);
    });
  }
  editable: boolean = false;
  toggle() {
    this.editable = !this.editable;
  }
  initAssetForm() {
    this.assetForm = this.fb.group({
      assetName: ['', Validators.required],
      assetType: ['', Validators.required],
      purchaseDate: ['', Validators.required],
      warrantyExpiry: ['', Validators.required],
      status: ['', Validators.required],
      image: [''],
      customAttributes: new FormArray([]),
    });
  }
  initCustomAttributes() {
    return this.fb.group({
      attributeName: ['', Validators.required],
      description: [''],
      dataType: [''],
      isRequired: [false],
      value: [''],
    });
  }

  addCustomAttribute(): void {
    const customAttribute = this.fb.group({
      attributeName: ['', Validators.required],
      description: [''],
      dataType: [''],
      isRequired: [false],
      value: [''],
    });
    (this.assetForm.get('customAttributes') as FormArray).push(customAttribute);
  }


  getAssetStatusList() {
    this.assetService.getStatusList().subscribe((response: any) => {
      this.assetStatuses = response.data;
    });
  }

  filterAssets() {
    this.filteredAssets = this.assets.filter((asset) =>
      asset.assetName?.toLowerCase().includes(this.searchText?.toLowerCase())
    );
  }

  addAsset() {
    this.assetService.addAsset(this.assetForm.value).subscribe(
      (response: any) => {
      this.updateCustomAttributes(response.data._id);
        this.loadAssets(this.selectedAssetType);
        this.toast.success('Asset added successfully!');
      },
      (error) => {
        this.toast.error('Error adding asset', 'Error!');
      }
    );
  }
  customAttribute: string;

  editAsset(asset: Asset) {
    this.isEdit = true;
    this.selectedAsset = asset;
    this.selectedCustomAttributes = this.selectedAsset.customAttributes;
    this.assetForm.patchValue(asset);
    this.selectedAssetTypeName = this.getAssetTypeName(asset.assetType);

    if (asset.customAttributes && asset.customAttributes.length > 0) {
      (<FormArray>this.assetForm.get('customAttributes')).clear();
      asset.customAttributes.forEach((attribute) => {
        const attributeFormGroup = new FormGroup({
          id: new FormControl(attribute._id),
          attributeName: new FormControl(attribute.attributeName),
          description: new FormControl(attribute.description),
          isRequired: new FormControl(attribute.isRequired),
          dataType: new FormControl(attribute.dataType),
          value: new FormControl(attribute.value, Validators.required),
        });
        (<FormArray>this.assetForm.get('customAttributes')).push(
          attributeFormGroup
        );
      });
    }
  }
  trackByIndex(index: number, customAttribute: CustomAttribute): any {
    return index;
  }
  updateAsset() {
    this.assetService
      .updateAsset(this.selectedAsset._id, this.assetForm.value)
      .subscribe(
        (response: any) => {
          this.filteredAssets = response.data;
          this.updateCustomAttributes(this.selectedAsset._id);
          this.loadAssets(this.selectedAsset.assetType);

          this.assetForm.reset();
          this.toast.success('Asset updated successfully!');
          this.isEdit = false;
          this.editable = false;
          this.assetForm.reset();
          this.assetTypes = [];
          this.assetStatuses = [];
          this.selectedAssetType = null;
          this.ngOnInit();
        },
        (error) => {
          this.toast.error('Error updating asset', 'Error!');
        }
      );
  }

  loadAssetTypes() {
    this.assetService.getAllAssetTypes().subscribe(
      (response) => {
        this.assetTypes = response.data;
        if (this.assetTypes && this.assetTypes.length > 0) {
          this.selectedAssetType = this.assetTypes[0]._id;
          this.assetForm.patchValue({assetType: this.selectedAssetType});
          this.selectedAssetTypeName = this.assetTypes[0].typeName;
          this.getCustomAttributesByAssetType(this.selectedAssetType)
            .then(() => {
              this.gridHeadings = [];
              if (response.data && response.data.length > 0) {
                this.populatingHeadings(response.data[0].customAttributes);
              } else {
                this.populatingHeadings(this.selectedCustomAttributes);
              }
              this.populateCustomFieldsForNewAsset();
              this.loadAssets(this.selectedAssetType);
            })
            .catch((error) => {
              // Handle errors here
              console.error(error);
            });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  getAssetTypeName(assetTypeId: string): string {
    const assetType = this.assetTypes.find((type) => type._id === assetTypeId);
    return assetType ? assetType.typeName : 'Unknown'; // Return typeName or 'Unknown' if not found
  }

  openDialog(asset: Asset): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: asset,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteAsset(asset);
      }
      (err) => {
        this.toast.error('Can not be Deleted', 'Error!');
      };
    });
  }
  deleteAsset(asset: Asset) {
    this.assetService.deleteAsset(asset._id).subscribe((response) => {
      this.assetService.deleteAssetAttributes(asset._id).subscribe((response) => {
        this.loadAssets(asset.assetType);
        this.toast.success('Asset added successfully!');
      });
    });
  }

  onAssetTypeChange() {
    this.loadAssets(this.selectedAssetType);
  }

  loadAssets(assetTypeId) {
    this.assetForm.patchValue({assetType: assetTypeId});
    this.selectedAssetTypeName = this.assetTypes.filter(
      (at) => at._id === assetTypeId
    )[0]?.typeName;
    this.assetService.getAllAssetsByType(assetTypeId).subscribe(
      (response) => {
        this.assets = response.data;
        this.filteredAssets = this.assets;
        this.getCustomAttributesByAssetType(assetTypeId)
          .then(() => {
            this.gridHeadings = [];
            if (response.data && response.data.length > 0) {
              this.populatingHeadings(response.data[0].customAttributes);
            } else {
              this.populatingHeadings(this.selectedCustomAttributes);
            }
            this.populateCustomFieldsForNewAsset();
          })
          .catch((error) => {
            // Handle errors here
            console.error(error);
          });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  populatingHeadings(customeAttributes) {
    if (customeAttributes && customeAttributes.length > 0) {
      this.gridHeadings = [];
      customeAttributes.forEach((element) => {
        this.gridHeadings.push(element.attributeName);
      });
    }
  }

  getStatusName(id: string) {
    const statusName = this.assetStatuses.find((status) => status._id === id);
    return statusName?.statusName;
  }

  populateCustomFieldsForNewAsset() {
      (<FormArray>this.assetForm.get('customAttributes')).clear();
      this.selectedCustomAttributes.forEach((attribute) => {
        const attributeFormGroup = new FormGroup({
          id: new FormControl(attribute._id),
          attributeName:new FormControl(attribute.attributeName),
          description: new FormControl(attribute.description),
          isRequired : new FormControl(attribute.isRequired),
          dataType : new FormControl(attribute.dataType),
          value: new FormControl(attribute.value, Validators.required),
        });
        (<FormArray>this.assetForm.get('customAttributes')).push(attributeFormGroup);
      });
  }

  getCustomAttributesByAssetType(assetTypeId): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.assetService.getAssetTypeCustomAttributes(assetTypeId).subscribe(
        (response) => {
          this.selectedAssetTypeCustomAttributes = response.data;

          if (response.data && response.data.length > 0) {
            this.selectedCustomAttributes = response.data;
            this.selectedCustomAttributes.forEach(
              (attribute) => (attribute.value = null)
            );
          } else {
            this.selectedCustomAttributes = [];
          }
          resolve(); // Resolve the promise when the operation is complete
        },
        (error) => {
          console.log(error);
          reject(error); // Reject the promise in case of an error
        }
      );
    });
  }
  updateCustomAttributes(assetId:string){
    this.assetForm.value.customAttributes.forEach((ca) => {
      const assetAttributeValue: AssetAttributeValue = {
        assetId: assetId,
        attributeId: ca.id,
        value: ca.value,
      };
      this.assetService
        .upsertCustomAttribute(assetAttributeValue)
        .subscribe((response: any) => {});
    });
  }

  validateOption(dataType:string, fieldValue:string ): boolean {
    if (dataType?.toLowerCase() === 'string' || dataType?.toLowerCase() === 'number') {
      // Implement your validation logic here
      // Example: Return false if the value is empty
      return fieldValue !== '';
    } else if (dataType?.toLowerCase() === 'boolean') {
      // No specific validation needed for boolean options
      return true;
    } else if (dataType?.toLowerCase() === 'date') {
      // Implement your validation logic for date
      // Example: Return false if the date is not valid
      return this.isValidDate(fieldValue);
    }
    // ... Implement similar logic for other data types ...
    return true;
  }

  isValidDate(date: any): boolean {
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    } else if (date instanceof Date) {
      return !isNaN(date.getTime());
    }
    return false;
  }
}
