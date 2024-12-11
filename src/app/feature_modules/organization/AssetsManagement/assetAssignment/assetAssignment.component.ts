import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { Asset, AssetStatus, AssetType } from 'src/app/models/AssetsManagement/Asset';

@Component({
  selector: 'app-assign-assets',
  templateUrl: './assetAssignment.component.html',
  styleUrls: ['./assetAssignment.component.css']
})
export class AssignAssetsComponent implements OnInit {
  userId:string;
  unAssignedAssets: any[] = [];
  assignedAssets: any;
  assetTypes: AssetType[] = [];
  filteredAssetTypes: any;
  assetStatuses: AssetStatus[]=[];

  constructor(private assetManagementService:AssetManagementService, private toast:ToastrService ) { }

  ngOnInit(): void {
    // Load initial data if needed
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId= currentUser.id;
    this.loadAssignedAssets();
    this.loadUnAssignedAssets();
    this.getAllAssetTypes();
    this.getAssetStatusList()
  }

  loadUnAssignedAssets() {
    this.assetManagementService.getEmployeeUnAssignedAssets(this.userId).subscribe(response => {
      this.unAssignedAssets = response.data;
  });
  }

  loadAssignedAssets() {
    this.assetManagementService.getEmployeeAssets(this.userId).subscribe(response => {
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
  getAllAssetTypes() {
    this.assetManagementService.getAllAssetTypes().subscribe(response => {
      this.assetTypes = response.data;
      this.filteredAssetTypes = this.assetTypes;
  });
  }

  
  getAssetTypeName(assetTypeId: string): string {
    const assetType = this.filteredAssetTypes.find((type) => type._id === assetTypeId);
    return assetType ? assetType.typeName : 'Unknown'; // Return typeName or 'Unknown' if not found
  }
  getStatusName(id:string){
    const statusName = this.assetStatuses.find((status) => status._id === id);
    return statusName? statusName.statusName: '';
  }
  getAssetStatusList() {
    this.assetManagementService.getStatusList().subscribe((response: any) => {
      this.assetStatuses = response.data;
    });
  }  
  
}
