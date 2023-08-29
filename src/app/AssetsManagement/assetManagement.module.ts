import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { AssetStatusComponent } from "./assetStatusComponent/assetStatus.component";
import { VendorComponent } from "./vendorComponent/vendor.component";
import { AssetTypeComponent } from "./assetTypeComponent/assetType.component";
import { AssignAssetsComponent } from "./assetAssignment/assetAssignment.component";
import { CommonComponentsModule } from "../common/commonComponents.module";
import { VendorAssetsComponent } from "./vendorAssets/vendorAssets..component";
import { AssetComponent } from "./asset/asset.component";
import { AssetManagerComponent } from "./assetAssetManager/asset.component";


@NgModule({
    declarations: [AssetComponent, AssetStatusComponent, VendorComponent, AssetTypeComponent, AssignAssetsComponent,
    VendorAssetsComponent,AssetManagerComponent],
    exports: [AssetComponent, AssetStatusComponent, VendorComponent, AssetTypeComponent, AssignAssetsComponent,
      VendorAssetsComponent,AssetManagerComponent],
    imports: [SharedModule, CommonComponentsModule]
})
export class AssetsModule{

}
