import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AssetManagementService } from 'src/app/_services/assetManagement.service';
import { AssetType, CustomAttribute, UpdateCustomAttribute } from 'src/app/models/AssetsManagement/Asset';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';


@Component({
  selector: 'app-asset-type',
  templateUrl: './assetType.component.html',
  styleUrls: ['./assetType.component.css']
})
export class AssetTypeComponent implements OnInit {
  assetTypes: AssetType[] = [];
  filteredAssetTypes: AssetType[] = [];
  assetTypeForm: FormGroup;
  _isEdit = false;
  selectedAssetType: any;
  p = 1;
  newCustomAttribute: any;
  private searchSubject = new Subject<string>(); // Subject for debounce handling
  columns: TableColumn[] = [
    { key: 'typeName', name: 'Name' },
    { key: 'description', name: 'Description' },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: 'text-danger', hideCondition: (row: any) => { return !row.isDeletable } },
      ]
    }
  ]

  //pagination
  totalRecords: number = 0// example total records
  recordsPerPage: number = 10;
  currentPage: number = 1;
  totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);

  constructor(private fb: FormBuilder,
    private toast: ToastrService,
    private assetManagementService: AssetManagementService,
    private dialog: MatDialog
  ) {
    this.selectedAssetType = {
      customAttributes: []
    };
  }

  ngOnInit(): void {
    this.initTypeForm();
    this.getAllAssetTypes();
    // Apply debounce to searchQuery changes
    this.searchSubject
      .pipe(debounceTime(300)) // Wait for 300ms pause in typing
      .subscribe((query) => {
        this.filterAssetTypes(query); // Call the filter function with the debounced value
      });
  }
  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.editAssetType(event.row)
        break;
      case 'Delete':
        this.openDialog(event.row)
        break;
    }
  }

  initTypeForm() {
    this.assetTypeForm = this.fb.group({
      typeName: ['', Validators.required],
      description: [''],
      customAttributes: this.fb.array([])
    });
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
      this.resetForm();
    }
  }

  // Getters for form controls
  get typeName() {
    return this.assetTypeForm.get('typeName');
  }

  get customAttributes() {
    return this.assetTypeForm.get('customAttributes') as FormArray;
  }


  addNewCustomAttribute() {
    const customAttributesArray = this.assetTypeForm.get('customAttributes') as FormArray;

    // Check if there is any empty custom attribute form group
    const hasEmptyRow = customAttributesArray.controls.some(control => {
      return !control.get('attributeName')?.value?.trim() ||
        !control.get('dataType')?.value?.trim();
    });

    if (hasEmptyRow) {
      this.toast.warning('Please fill in the existing custom attribute before adding a new one.');
      return;
    }

    // Add a new custom attribute form group
    customAttributesArray.push(this.createCustomAttributeFormGroup());
  }

  createCustomAttributeFormGroup(): FormGroup {
    return this.fb.group({
      attributeName: ['', Validators.required],
      description: [''],
      dataType: ['string', Validators.required],
      isRequired: [false, Validators.required]
    });
  }

  removeCustomAttribute(index: number) {
    const customAttributesArray = this.assetTypeForm.get('customAttributes') as FormArray;
    customAttributesArray.removeAt(index);
  }

  deleteCustomAttribute(index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.removeCustomAttribute(index);
      }
      err => {
      }
    });
  }
  getAllAssetTypes() {
    const skip = ((this.currentPage - 1) * this.recordsPerPage);
    this.assetManagementService.getAllAssetTypes(skip, this.recordsPerPage).subscribe(response => {
      this.assetTypes = response.data;
      this.totalRecords = response.totalRecords;
      this.filteredAssetTypes = this.assetTypes;
    });
  }

  // This is triggered on each input event
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement; // Cast the target to HTMLInputElement
    const query = input.value.trim(); // Get the value and trim spaces
    this.searchSubject.next(query); // Send the value to the debounced Subject
  }

  filterAssetTypes(query: string): void {
    console.log('Filtering asset types with query:', query);
    this.filteredAssetTypes = this.assetTypes.filter(assetType =>
    (assetType.description.toLowerCase().includes(query.toLowerCase())
      || assetType.typeName.toLowerCase().includes(query.toLowerCase())));
  }

  createAssetType() {
    if (this.assetTypeForm.valid) {
      if (this._isEdit) {
        this.assetManagementService.updateAssetType(this.selectedAssetType._id, this.assetTypeForm.value).subscribe(response => {
          this.toast.success('Asset Type Updated Successfully!');
          this.getAllAssetTypes();
          this.resetForm();
        }, (error) => {
          this.toast.error('Error Saving the Asset Type!', 'Error!');
        });
      }
      else {
        this.assetManagementService.addAssetType(this.assetTypeForm.value).subscribe(response => {
          this.toast.success('Asset Type Created Successfully!');
          this.getAllAssetTypes();
          this.resetForm();
        }, (error) => {
          this.toast.error('Error Saving the Asset Type!', 'Error!');
        });
      }
    }
  }
  resetAsset() {
    this.resetForm();
    this.isEdit = false;
  }

  addCustomAttributes() {
    this.selectedAssetType
    if (this.selectedAssetType && this.selectedAssetType.customAttributes) {
      const existingCustomAttributes = this.selectedAssetType.customAttributes;

      const newCustomAttributes = this.assetTypeForm.value.customAttributes || [];
      const customAttributesToAdd = newCustomAttributes.filter((newAttribute) => {
        return !existingCustomAttributes.some((existingAttribute) => {
          return (
            existingAttribute.attributeName === newAttribute.attributeName &&
            existingAttribute.description === newAttribute.description &&
            existingAttribute.dataType === newAttribute.dataType &&
            existingAttribute.isRequired === newAttribute.isRequired
          );
        });
      });

      if (customAttributesToAdd.length > 0) {
        this.selectedAssetType.customAttributes.push(customAttributesToAdd[customAttributesToAdd.length - 1]);
        this.assetManagementService.addCustomAttributes(this.selectedAssetType._id || this.selectedAssetType[0].assetType, [customAttributesToAdd[customAttributesToAdd.length - 1]]).subscribe((response: any) => {
          this.newCustomAttribute = response && response.data;
          this.selectedAssetType.customAttributes = this.newCustomAttribute;
          this.getAllAssetTypes();
          this.toast.success('Custom Attribute added successfully!');
        });
      } (error) => {
        this.toast.error('No new custom attributes to add.');
      }
    }
  }
  editAssetType(assetType: AssetType) {
    this.isEdit = true;
    this.selectedAssetType = assetType;
    this.assetTypeForm.patchValue({
      typeName: assetType.typeName,
      description: assetType.description
    });
    //this.assetTypeForm.get('typeName')?.disable();
    //this.assetTypeForm.get('description')?.disable();
    this.customAttributes.clear();
    // Populate customAttributes FormArray without clearing it
    assetType.customAttributes.forEach(attr => {
      const attribute = this.fb.group({
        attributeName: [attr.attributeName, Validators.required],
        description: [attr.description, Validators.required],
        dataType: [attr.dataType, Validators.required],
        isRequired: [attr.isRequired]
      });
      this.customAttributes.push(attribute);
    });
  }


  viewAssetType(assetType: AssetType) {
    this.selectedAssetType = assetType;
    //this.assetTypeForm.patchValue(assetType);
  }

  updateCustomAttribute(index: number) {
    const customAttribute = this.selectedAssetType.customAttributes[index];
    const customAttributeId = customAttribute._id;
    const customAttributesArray = this.assetTypeForm.get('customAttributes') as FormArray;
    const customAttributeFormGroup = customAttributesArray.at(index);

    const attributeName = customAttributeFormGroup.get('attributeName').value;
    const description = customAttributeFormGroup.get('description').value;
    const dataType = customAttributeFormGroup.get('dataType').value;
    const isRequired = customAttributeFormGroup.get('isRequired').value;

    const updatedAttribute: UpdateCustomAttribute = {
      attributeName: attributeName,
      dataType: dataType,
      description: description,
      isRequired: isRequired
    };

    this.assetManagementService.updateCustomAttribute(customAttributeId, updatedAttribute).subscribe(
      (response) => {
        // Update the form control values with the updated data
        customAttribute.attributeName = attributeName;
        customAttribute.description = description;
        customAttribute.dataType = dataType;
        customAttribute.isRequired = isRequired;
        this.toast.success('Custom Attribute updated successfully!');
        this.getAllAssetTypes();
      },
      (error) => {
        this.toast.error('Error updating custom attribute', 'Error!');
      }
    );
  }

  deleteAssetType(assetType) {
    this.assetManagementService.deleteAssetType(assetType._id).subscribe(response => {
      this.toast.success('Asset Type deleted successfully!');
      this.getAllAssetTypes();

    });
    (error) => {
      this.toast.error('Asset Type Cannot be Deleted!');
    }
  }

  deleteCustomeAttribute(index: number) {
    this.customAttributes.removeAt(index);
  }

  addCustomAttribute(): void {
    const attribute = this.fb.group({
      attributeName: ['', Validators.required],
      description: ['', Validators.required],
      dataType: ['', Validators.required],
      isRequired: [false]
    });
    this.customAttributes.push(attribute);
  }
  openDialog(assetType): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: assetType
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAssetType(assetType);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

  checkDuplicateStatusName(control: any) {
    const statusType = control.value;
    // Check if the value is empty
    if (!control.value || control.value.trim() === '') {
      return null; // Let the `Validators.required` handle empty values
    }
    const isDuplicate = this.assetTypes?.find(type =>
      type.typeName.toLowerCase() === statusType.toLowerCase() &&
      (!this.isEdit || type._id !== this.selectedAssetType?._id)
    );
    return isDuplicate ? { duplicate: true } : null;
  }
  resetForm(): void {
    // Clear the customAttributes FormArray
    while (this.customAttributes.length !== 0) {
      this.customAttributes.removeAt(0);
    }
    // Reset the entire form
    this.assetTypeForm.reset();
  }

  //pagination
  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllAssetTypes();
  }
  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getAllAssetTypes();
  }
}
