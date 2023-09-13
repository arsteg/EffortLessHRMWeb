import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { Asset, AssetStatus, AssetType, CustomAttribute } from 'src/app/models/AssetsManagement/Asset';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.css']
})
export class AssetComponent implements OnInit {
  assetTypes: AssetType[] = [];
  assetStatuses: AssetStatus[] = [];
  gridHeadings: string[];
  selectedAssetType: AssetType[]=[];
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  assetForm: FormGroup;
  isEdit = false;
  selectedAsset: Asset;
  p = 1;
  customAttributeGroup: FormGroup;

  constructor(private fb: FormBuilder,
     private assetService: AssetManagementService,
      private toast: ToastrService,
      private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadAssetTypes();
    this.initAssetForm();
    this.getAssetStatusList();
    this.getAssets();

  }
  editable: boolean= false;
  toggle(){
    this.editable = !this.editable;
  }
  initAssetForm() {
    this.assetForm = this.fb.group({
      assetName: ['', Validators.required],
      assetType: ['', Validators.required],
      company: [''],
      purchaseDate: ['', Validators.required],
      warrantyExpiry: ['', Validators.required],
      status: ['', Validators.required],
      serialNumber: [''],
      cost: ['', [Validators.min(0)]],  // Assuming cost can't be negative
      image: [''],
      customAttributes: this.fb.array([])
    });
  }

  getAssets() {
    this.assetService.getAllAssets().subscribe((response: any) => {
      this.assets = response;
      this.filteredAssets = this.assets;
    });
  }
  getAssetStatusList() {
    this.assetService.getStatusList().subscribe((response: any) => {
      this.assetStatuses = response.data;
    });
  }

  filterAssets($event) {
    const searchQuery = ($event).value?.toLowerCase();
    this.filteredAssets = this.assets.filter(asset => asset.assetName?.toLowerCase().includes(searchQuery));
  }

  addAsset() {
    this.assetService.addAsset(this.assetForm.value).subscribe( (response: any) => {
     this.filteredAssets = response.data;
     this.loadAssets(this.selectedAsset.assetType);
        this.getAssets();
        this.assetForm.reset();
        this.toast.success('Asset added successfully!');
      },
      error => {
        this.toast.error('Error adding asset', 'Error!');
      }
    );
  }
  selectedAssetTypeName: string;
  customAttribute: string;
  editAsset(asset: Asset) {
    this.isEdit = true;
    this.selectedAsset = asset;
    this.assetForm.patchValue(asset);
    this.selectedAssetTypeName = this.getAssetTypeName(asset.assetType);
    this.selectedAsset.status = this.getStatusName(asset.status);
    const customAttributesArray = this.assetForm.get('customAttributes') as FormArray;
    customAttributesArray.clear(); // Clear existing custom attributes
  
    if (asset.customAttributes && asset.customAttributes.length > 0) {
      asset.customAttributes.forEach((attribute) => {
        this.customAttributeGroup = this.fb.group({
          attributeName: [attribute.attributeName]
        });

        customAttributesArray.push(this.customAttributeGroup);
      });
    }
  }
  trackByIndex(index: number, customAttribute: CustomAttribute): any {
    return index;
  }
  updateAsset() {
   
    this.assetService.updateAsset(this.selectedAsset._id, this.assetForm.value).subscribe((response: any) => {
      this.filteredAssets = response.data;
      this.loadAssets(this.selectedAsset.assetType);
      this.assetForm.reset();
        this.toast.success('Asset updated successfully!');
        this.isEdit = false;
        this.editable = false; 
        this.assetForm.reset();
        this.assetTypes = [];
        this.assetStatuses = [];
        this.selectedAssetType = [];
        this.ngOnInit();
      },
      error => {
        this.toast.error('Error updating asset', 'Error!');
      }
    );
  }

  loadAssetTypes() {
    this.assetService.getAllAssetTypes().subscribe(
      response => {
        this.assetTypes = response.data;
      },
      error => {
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
      data: asset
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAsset(asset);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
  deleteAsset(asset: Asset) {
   
      this.assetService.deleteAsset(asset._id).subscribe(
        response => {
          this.loadAssets(asset.assetType);
        });
  }

  onAssetTypeChange() {
    this.loadAssets(this.selectedAssetType);
  }

  loadAssets(assetTypeId) {
    this.assetService.getAllAssetsByType(assetTypeId).subscribe(
      response => {
        this.assets = response.data;
        this.filteredAssets = this.assets;
        if (response.data && response.data.length > 0) {
          this.populatingHeadings(response.data[0].customAttributes)
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  populatingHeadings(customeAttributes) {
    if (customeAttributes && customeAttributes.length > 0) {
      this.gridHeadings = [];
      customeAttributes.forEach(element => {
        this.gridHeadings.push(element.attributeName);
      });
    }
  }

  getStatusName(id: string) {
    const statusName = this.assetStatuses.find(status => status._id === id);
    return statusName?.statusName;
  }

}