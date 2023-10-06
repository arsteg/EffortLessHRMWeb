import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationComponent } from './organization/organization.component';
import { SharedModule } from '../shared/shared.Module';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { AssetsModule } from '../AssetsManagement/assetManagement.module';
import { AssetManagerComponent } from '../AssetsManagement/assetAssetManager/asset.component';
import { DocumentManagementModule } from '../documentManager/documentManager.module';
import { DocumentManagerComponent } from '../documentManager/documentManager.component';



@NgModule({
  declarations: [
    OrganizationComponent
  ],
  exports: [AssetManagerComponent, DocumentManagerComponent],
  imports: [
    CommonModule, SharedModule, CommonComponentsModule, AssetsModule, DocumentManagementModule, DocumentManagementModule

  ]
})
export class OragnizationModule { }
