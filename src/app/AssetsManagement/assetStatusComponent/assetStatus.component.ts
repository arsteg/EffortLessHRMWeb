import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { AssetStatus } from 'src/app/models/AssetsManagement/Asset';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

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

    constructor(private fb: FormBuilder,
         private toast: ToastrService,
          private assetManagementService: AssetManagementService,
          private dialog: MatDialog
          ) { }

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
                  this.assetManagementService.deleteAssetStatus(status._id).subscribe(response => {
                this.toast.success('Asset Status deleted successfully!');
                this.getAssetStatuses();
            });
    }

    openDialog(status): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: '400px',
          data: status
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'delete') {
            this.deleteAssetStatus(status);
          }
          err => {
            this.toast.error('Can not be Deleted', 'Error!')
          }
        });
      }
}
