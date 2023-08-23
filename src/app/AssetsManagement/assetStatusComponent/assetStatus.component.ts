import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { AssetStatus } from 'src/app/models/AssetsManagement/Asset';

@Component({
  selector: 'app-asset-status',
  templateUrl: './assetStatus.component.html',
  styleUrls: ['./assetStatus.component.css']
})
export class AssetStatusComponent implements OnInit {
    assetStatuses : AssetStatus[]; // This should ideally be an array of AssetStatus type
    assetStatusForm: FormGroup;
    isEdit = false;
    selectedStatus: any; // Ideally, this should be of type AssetStatus

    constructor(private fb: FormBuilder, private toast: ToastrService, private assetManagementService: AssetManagementService) { }

    ngOnInit(): void {
        this.initForm();
        this.getAssetStatuses();
    }

    initForm() {
        this.assetStatusForm = this.fb.group({
          statusName: ['', Validators.required]
        });
    }

    getAssetStatuses() {
        this.assetManagementService.getAllAssetStatuses().subscribe(response => {
            this.assetStatuses = response.data
        });
    }

    addAssetStatus() {
        this.assetManagementService.addAssetStatus(this.assetStatusForm.value).subscribe(response => {
            this.toast.success('Asset Status added successfully!');
            this.getAssetStatuses();
            this.assetStatusForm.reset();
        });
    }

    editAssetStatus(status) {
        this.isEdit = true;
        this.selectedStatus = status;
        this.assetStatusForm.patchValue(status);
    }

    updateAssetStatus() {
        this.assetManagementService.updateAssetStatus(this.selectedStatus._id, this.assetStatusForm.value).subscribe(response => {
            this.toast.success('Asset Status updated successfully!');
            this.getAssetStatuses();
            this.isEdit = false;
            this.assetStatusForm.reset();
        });
    }

    deleteAssetStatus(status) {
        const result = window.confirm('Are you sure you want to delete this status?');
        if (result) {
            this.assetManagementService.deleteAssetStatus(status._id).subscribe(response => {
                this.toast.success('Asset Status deleted successfully!');
                this.getAssetStatuses();
            });
        }
    }
}
