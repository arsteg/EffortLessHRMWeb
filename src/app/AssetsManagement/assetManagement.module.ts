import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { AssetComponent } from "./assetComponent/asset.component";
import { AssetStatusComponent } from "./assetStatusComponent/assetStatus.component";
import { VendorComponent } from "./vendorComponent/vendor.component";
import { AssetTypeComponent } from "./assetTypeComponent/assetType.component";
import { AssignAssetsComponent } from "./assetAssignment/assetAssignment.component";
import { CommonComponentsModule } from "../common/commonComponents.module";
import { VendorAssetsComponent } from "./vendorAssets/vendorAssets..component";


@NgModule({
    declarations: [AssetComponent, AssetStatusComponent, VendorComponent, AssetTypeComponent, AssignAssetsComponent,
    VendorAssetsComponent],
    exports: [AssetComponent, AssetStatusComponent, VendorComponent, AssetTypeComponent, AssignAssetsComponent,
      VendorAssetsComponent],
    imports: [SharedModule, CommonComponentsModule]
})
export class AssetsModule{

}
