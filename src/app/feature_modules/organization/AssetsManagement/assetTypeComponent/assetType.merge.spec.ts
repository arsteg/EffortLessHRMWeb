import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AssetTypeComponent } from './assetType.component';

describe('Asset type merge regression', () => {
  let component: AssetTypeComponent;
  let service: any;
  let toast: any;
  beforeEach(() => {
    service = jasmine.createSpyObj('AssetManagementService', ['deleteCustomAttributes', 'addAssetType', 'updateAssetType', 'getAllAssetTypes']);
    service.deleteCustomAttributes.and.returnValue(of({}));
    service.addAssetType.and.returnValue(of({}));
    service.updateAssetType.and.returnValue(of({}));
    service.getAllAssetTypes.and.returnValue(of({ data: [], totalRecords: 0 }));
    toast = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);
    component = new AssetTypeComponent(new FormBuilder(), toast, service, {} as any);
    component.initTypeForm();
  });
  it('starts with the list and supports adding and cancelling without losing validation', () => {
    expect(component.isEdit).toBeNull();
    component.onAddAssetType();
    expect(component.isEdit).toBeFalse();
    component.assetTypeForm.patchValue({ typeName: '   ' });
    component.createAssetType();
    expect(service.addAssetType).not.toHaveBeenCalled();
    expect(component.typeName.hasError('whitespace')).toBeTrue();
    component.resetAsset();
    expect(component.isEdit).toBeNull();
  });
  it('retains update instead of creating a duplicate when editing', () => {
    component.editAssetType({ _id: 'test-type', typeName: 'Test device', description: 'Test description', customAttributes: [] } as any);
    component.createAssetType();
    expect(service.updateAssetType).toHaveBeenCalledWith('test-type', jasmine.objectContaining({ typeName: 'Test device' }));
    expect(service.addAssetType).not.toHaveBeenCalled();
  });
  it('removes unsaved attributes locally and persisted attributes through the existing API', () => {
    component.addNewCustomAttribute();
    component.removeCustomAttribute(0);
    expect(component.customAttributes.length).toBe(0);
    expect(service.deleteCustomAttributes).not.toHaveBeenCalled();
    component.editAssetType({ _id: 'test-type', typeName: 'Test', customAttributes: [{ _id: 'test-attribute', attributeName: 'Serial', description: 'Test', dataType: 'string', isRequired: false }] } as any);
    component.removeCustomAttribute(0);
    expect(service.deleteCustomAttributes).toHaveBeenCalledWith('test-attribute');
    expect(component.customAttributes.length).toBe(0);
  });
  it('keeps the attribute available when its delete request fails', () => {
    component.editAssetType({ _id: 'test-type', typeName: 'Test', customAttributes: [{ _id: 'test-attribute', attributeName: 'Serial', description: 'Test', dataType: 'string', isRequired: false }] } as any);
    service.deleteCustomAttributes.and.returnValue(throwError(() => new Error('Test failure')));
    component.removeCustomAttribute(0);
    expect(component.customAttributes.length).toBe(1);
    expect(component.selectedAssetType.customAttributes.length).toBe(1);
    expect(toast.error).toHaveBeenCalled();
  });
});
