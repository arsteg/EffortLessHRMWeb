

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

  vendors: any;  // Sample structure. Adjust as per your model.
  assets: any;  // Sample structure. Adjust as per your model.
  userId:string;
  selectedVendor: number;  // To hold the selected vendor's ID.


  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId= currentUser.id;

    // this.loadVendors();
    // this.loadAssets();

    this.getAllVendors();
    this.getAllAssets();
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
getAllVendors(){
  this.assetManagementService.getAllVendors().subscribe((res: any)=>{
    this.vendors = res.data;

  })
}

  getAllAssets(){
    this.assetManagementService.getAllAssets().subscribe((res: any)=>{
      this.assets = res.data;
  
    })
  }



}

