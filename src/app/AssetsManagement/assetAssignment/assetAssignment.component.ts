import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { Asset } from 'src/app/models/AssetsManagement/Asset';

@Component({
  selector: 'app-assign-assets',
  templateUrl: './assetAssignment.component.html',
  styleUrls: ['./assetAssignment.component.css']
})
export class AssignAssetsComponent implements OnInit {
  userId:string;
  unAssignedAssets: any[] = [];
  assignedAssets: any[] = [];

  constructor(private assetManagementService:AssetManagementService, private toast:ToastrService ) { }

  ngOnInit(): void {
    // Load initial data if needed
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId= currentUser.id;
    this.loadAssignedAssets();
    this.loadUnAssignedAssets();
  }

  loadUnAssignedAssets() {
    this.assetManagementService.getEmployeeUnAssignedAssets(this.userId).subscribe(response => {
      this.unAssignedAssets = response.data;
  });
  }

  loadAssignedAssets() {
    this.assetManagementService.getEmployeeAssets(this.userId).subscribe(response => {
      console.log('Assigned Assets Response:', response.data); // <-- Add this line
      this.assignedAssets = response.data;
  });
  }

  assignAsset(asset: Asset) {
    this.assetManagementService.assignAsset(this.userId,asset._id).subscribe(response => {
      this.assignedAssets = response.data;
      this.loadAssignedAssets();
      this.loadUnAssignedAssets();
      this.toast.success('Asset has been assigned successfully!');
  });
  }

  unassignAsset(employeeAsset: any) {
    this.assetManagementService.unAssignAsset(this.userId,employeeAsset.Asset._id).subscribe(response => {
      this.loadAssignedAssets();
      this.loadUnAssignedAssets();
      this.toast.success('Asset has been unassigned successfully!');
  });
  }
  selectedUsersChanged($event: string): void {
    this.userId = $event;
    this.loadAssignedAssets();
    this.loadUnAssignedAssets();
  }
}
