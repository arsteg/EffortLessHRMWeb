import { NgModule } from "@angular/core";
import { AssetStatusComponent } from "./assetStatusComponent/assetStatus.component";
import { VendorComponent } from "./vendorComponent/vendor.component";
import { AssetTypeComponent } from "./assetTypeComponent/assetType.component";
import { AssignAssetsComponent } from "./assetAssignment/assetAssignment.component";
import { VendorAssetsComponent } from "./vendorAssets/vendorAssets..component";
import { AssetComponent } from "./asset/asset.component";
import { AssetManagerComponent } from "./assetAssetManager/asset.component";
import { FormsModule } from '@angular/forms';
import { UserAssetAssignmentComponent } from "./user-asset-assignment/user-asset-assignment.component";
import { SharedModule } from "src/app/shared/shared.Module";
import { CommonComponentsModule } from "src/app/common/commonComponents.module";

@NgModule({
    declarations: [AssetComponent, AssetStatusComponent, VendorComponent, AssetTypeComponent, AssignAssetsComponent,
    VendorAssetsComponent,AssetManagerComponent, UserAssetAssignmentComponent],
    exports: [AssetComponent, AssetStatusComponent, VendorComponent, AssetTypeComponent, AssignAssetsComponent,
      VendorAssetsComponent,AssetManagerComponent],
    imports: [
      SharedModule, CommonComponentsModule, FormsModule
    ]
})
export class AssetsModule{

}
