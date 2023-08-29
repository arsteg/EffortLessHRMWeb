

import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { Asset } from 'src/app/models/AssetsManagement/Asset';

@Component({
  selector: 'app-vendor-assets',
  templateUrl: './vendorAssets..component.html',
  styleUrls: ['./vendorAssets..component.css']
})
export class VendorAssetsComponent implements OnInit {

  vendors: { id: number, name: string }[] = [];  // Sample structure. Adjust as per your model.
  assets: { id: number, name: string, isSelected: boolean }[] = [];  // Sample structure. Adjust as per your model.
  userId:string;
  selectedVendor: number;  // To hold the selected vendor's ID.


  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId= currentUser.id;

    this.loadVendors();
    this.loadAssets();
  }

  // Sample function to load vendors. You might replace this with an API call.
  loadVendors(): void {
    // Dummy data. Replace this with actual data fetch.
    this.vendors = [
      { id: 1, name: 'Vendor A' },
      { id: 2, name: 'Vendor B' },
      // ... add more vendors as needed
    ];
  }

  // Sample function to load assets. You might replace this with an API call.
  loadAssets(): void {
    // Dummy data. Replace this with actual data fetch.
    this.assets = [
      { id: 1, name: 'Asset 1', isSelected: false },
      { id: 2, name: 'Asset 2', isSelected: false },
      // ... add more assets as needed
    ];
  }

  assignAssetsToVendor(): void {
    // Gather all selected assets.
    const selectedAssets = this.assets.filter(asset => asset.isSelected).map(asset => asset.id);

    // TODO: Make an API call or perform the necessary action to assign these assets to the selected vendor.
    // Example:
    // this.assetService.assignAssetsToVendor(this.selectedVendor, selectedAssets).subscribe(response => {
    //   console.log('Assets assigned successfully!', response);
    //   this.loadAssets();  // Optionally reload assets if needed.
    // });

    console.log(`Assigning assets ${selectedAssets.join(', ')} to vendor ${this.selectedVendor}`);
  }

  constructor(private assetManagementService:AssetManagementService, private toast:ToastrService ) { }









}

