import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { Asset } from 'src/app/models/AssetsManagement/Asset';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.css']
})
export class AssetManagerComponent implements OnInit {
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  assetForm: FormGroup;
  isEdit = false;
  selectedAsset: Asset;
  p = 1;
  selectedTab = 1;

  constructor(private fb: FormBuilder, private assetService: AssetManagementService, private toast: ToastrService) { }

  ngOnInit(): void {
    this.initAssetForm();
    this.getAssets();
  }

  initAssetForm() {
    this.assetForm = this.fb.group({
      assetName: ['', Validators.required],
      assetType: ['', Validators.required],
      company: ['', Validators.required],
      purchaseDate: ['', Validators.required],
      warrantyExpiry: ['', Validators.required],
      status: ['', Validators.required],
      serialNumber: ['', Validators.required],
      cost: ['', [Validators.required, Validators.min(0)]],  // Assuming cost can't be negative
      image: ['']
    });
}

selectTab(tabIndex: number) {
  this.selectedTab = tabIndex;
}
  getAssets() {
    this.assetService.getAllAssets().subscribe((response: any) => {
      this.assets = response;
      this.filteredAssets = this.assets;
    });
  }

  filterAssets($event) {
    const searchQuery = ($event).value?.toLowerCase();
    this.filteredAssets = this.assets.filter(asset => asset.assetName?.toLowerCase().includes(searchQuery));
  }

  addAsset() {
    this.assetService.addAsset(this.assetForm.value).subscribe(
      response => {
        this.toast.success('Asset added successfully!');
        this.getAssets();
      },
      error => {
        this.toast.error('Error adding asset', 'Error!');
      }
    );
  }

  editAsset(asset: Asset) {
    this.isEdit = true;
    this.selectedAsset = asset;
    this.assetForm.patchValue(asset);
  }

  updateAsset() {
    this.assetService.updateAsset(this.selectedAsset.assetId, this.assetForm.value).subscribe(
      response => {
        this.toast.success('Asset updated successfully!');
        this.getAssets();
        this.isEdit = false;
      },
      error => {
        this.toast.error('Error updating asset', 'Error!');
      }
    );
  }

  deleteAsset(asset: Asset) {
    const result = window.confirm('Are you sure you want to delete this asset?');
    if (result) {
      this.assetService.deleteAsset(asset.assetId).subscribe(
        response => {
          this.toast.success('Asset deleted successfully!');
          this.getAssets();
        },
        error => {
          this.toast.error('Error deleting asset', 'Error!');
        }
      );
    }
  }
}
