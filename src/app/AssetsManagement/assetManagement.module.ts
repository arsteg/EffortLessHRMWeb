import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { AssetComponent } from "./assetComponent/asset.component";
import { AssetStatusComponent } from "./assetStatusComponent/assetStatus.component";
import { VendorComponent } from "./vendorComponent/vendor.component";
import { AssetTypeComponent } from "./assetTypeComponent/assetType.component";


@NgModule({
    declarations:[AssetComponent,AssetStatusComponent,VendorComponent,AssetTypeComponent],
    exports:[AssetComponent,AssetStatusComponent,VendorComponent,AssetTypeComponent],
    imports:[SharedModule]
  })
export class AssetsModule{

}
