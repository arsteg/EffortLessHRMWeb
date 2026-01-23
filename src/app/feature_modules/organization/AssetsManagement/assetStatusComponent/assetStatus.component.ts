import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { AssetStatus } from 'src/app/models/AssetsManagement/Asset';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-asset-status',
  templateUrl: './assetStatus.component.html',
  styleUrls: ['./assetStatus.component.css']
})
export class AssetStatusComponent implements OnInit {
  assetStatuses: AssetStatus[]; // This should ideally be an array of AssetStatus type
  assetStatusesFiltered: AssetStatus[]; // This should ideally be an array of AssetStatus type
  assetStatusForm: FormGroup;
  private _isEdit = false; // Internal property for isEdit
  selectedStatus: any; // Ideally, this should be of type AssetStatus
  searchQuery: string = '';
  columns: TableColumn[] = [
    { key: 'statusName', name: 'Status' },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: 'text-danger', hideCondition: (row:any)=>{return !row.isDeletable} },
      ]
    }
  ]

  constructor(private fb: FormBuilder,
    private toast: ToastrService,
    private assetManagementService: AssetManagementService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getAssetStatuses();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.editAssetStatus(event.row)
        break;
      case 'Delete':
        this.openDialog(event.row)
        break;
    }
  }

  initForm() {
    this.assetStatusForm = this.fb.group({
      statusName: ['', [Validators.required, this.noWhitespaceValidator, this.checkDuplicateStatusName.bind(this)]]
    });
  }

  noWhitespaceValidator(control: any) {
    if (control.value && control.value.trim() === '') {
      return { whitespace: true };
    }
    return null;
  }
  // Getter and Setter for isEdit
  get isEdit(): boolean {
    return this._isEdit;
  }

  set isEdit(value: boolean) {
    this._isEdit = value;
    this.onIsEditChange(value); // Action to take when isEdit changes
  }
  onIsEditChange(value: boolean): void {
    if (value === false) {
      this.assetStatusForm.reset();
    }
  }

  getAssetStatuses() {
    this.assetManagementService.getAllAssetStatuses().subscribe(response => {
      this.assetStatuses = response.data
      this.assetStatusesFiltered = this.assetStatuses;
    });
  }

  addAssetStatus() {
    this.assetStatusForm.markAllAsTouched();
    if (this.assetStatusForm.invalid) {
      return;
    }
    const formValue = { ...this.assetStatusForm.value, statusName: this.assetStatusForm.value.statusName?.trim() };
    this.assetManagementService.addAssetStatus(formValue).subscribe(response => {
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
    this.assetStatusForm.markAllAsTouched();
    if (this.assetStatusForm.invalid) {
      return;
    }
    const formValue = { ...this.assetStatusForm.value, statusName: this.assetStatusForm.value.statusName?.trim() };
    this.assetManagementService.updateAssetStatus(this.selectedStatus._id, formValue).subscribe(response => {
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

  filterAssetStatus(): void {
    this.assetStatusesFiltered = this.assetStatuses.filter(assetType =>
      assetType.statusName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  // In the component class
  checkDuplicateStatusName(control: any) {
    const statusName = control.value;
    // Check if the value is empty
    if (!control.value || control.value.trim() === '') {
      return null; // Let the `Validators.required` handle empty values
    }
    const isDuplicate = this.assetStatuses?.find(status =>
      status.statusName.toLowerCase() === statusName.toLowerCase() &&
      (!this.isEdit || status._id !== this.selectedStatus?._id)
    );
    return isDuplicate ? { duplicate: true } : null;
  }
  clearForm() {
    this.assetStatusForm.reset();
    this.isEdit = false; // Optionally reset isEdit flag if needed
  }
}
