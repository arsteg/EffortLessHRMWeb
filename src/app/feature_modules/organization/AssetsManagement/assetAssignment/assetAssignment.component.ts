import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { Asset, AssetStatus, AssetType } from 'src/app/models/AssetsManagement/Asset';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-assign-assets',
  templateUrl: './assetAssignment.component.html',
  styleUrls: ['./assetAssignment.component.css']
})
export class AssignAssetsComponent implements OnInit {
  userId: string;
  unAssignedAssets: any[] = [];
  assignedAssets: any;
  assetTypes: AssetType[] = [];
  filteredAssetTypes: any;
  assetStatuses: AssetStatus[] = [];
  columns: TableColumn[] = [
    { key: 'assetName', name: 'Asset' },
    { key: 'assetType', name: 'Type', valueFn: (row: any) => this.getAssetTypeName(row?.assetType) },
    { key: 'status', name: 'Status', valueFn: (row: any) => this.getStatusName(row?.status) },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Assign', icon: '', visibility: ActionVisibility.LABEL },
      ]
    }
  ]
  assignedAssetsColumn: TableColumn[] = [
    { key: 'Asset.assetName', name: 'Asset' },
    { key: 'assetType', name: 'Type', valueFn: (row: any) =>  this.getAssetTypeName(row?.Asset.assetType) },
    { key: 'status', name: 'Status', valueFn: (row: any) =>  this.getStatusName(row?.Asset.status) },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Unassign', icon: '', visibility: ActionVisibility.LABEL, cssClass: 'text-danger' },
      ],
    }
  ]

  constructor(private assetManagementService: AssetManagementService, private toast: ToastrService) { }

  ngOnInit(): void {
    // Load initial data if needed
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = currentUser.id;
    this.getAssetStatusList()
    this.loadAssignedAssets();
    this.loadUnAssignedAssets();
    this.getAllAssetTypes();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Assign':
        this.assignAsset(event.row)
        break;
      case 'Unassign':
        this.unassignAsset(event.row)
        break;
    }
  }

  loadUnAssignedAssets() {
    this.assetManagementService.getUnAssignedAssets().subscribe(response => {
      this.unAssignedAssets = response.data;
    });
  }

  loadAssignedAssets() {
    this.assetManagementService.getEmployeeAssets(this.userId).subscribe(response => {
      this.assignedAssets = response.data.filter((row: any) => row.Employee === this.userId);
    });
  }

  assignAsset(asset: Asset) {
    this.assetManagementService.assignAsset(this.userId, asset._id).subscribe(response => {
      this.assignedAssets = response.data;
      this.loadAssignedAssets();
      this.loadUnAssignedAssets();
      this.toast.success('Asset has been assigned successfully!');
    });
  }

  unassignAsset(employeeAsset: any) {
    this.assetManagementService.unAssignAsset(this.userId, employeeAsset.Asset._id).subscribe(response => {
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
    this.assetManagementService.getAllAssetTypes(0, 0).subscribe(response => {
      this.assetTypes = response.data;
      this.filteredAssetTypes = this.assetTypes;
    });
  }
  getAssetTypeName(assetTypeId: string): string {
    const assetType = this.filteredAssetTypes.find((type) => type._id === assetTypeId);
    return assetType ? assetType.typeName : 'Unknown'; // Return typeName or 'Unknown' if not found
  }
  getStatusName(id: string) {
    const statusName = this.assetStatuses.find((status) => status._id === id);
    return statusName ? statusName.statusName : '';
  }
  getAssetStatusList() {
    this.assetManagementService.getStatusList().subscribe((response: any) => {
      this.assetStatuses = response.data;
    });
  }
}
