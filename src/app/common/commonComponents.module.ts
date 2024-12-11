import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { SubordinateSelectionComponent } from "./subordinateSelection/subordinateSelection.component";
import { CRUDComponent } from './crud/crud.component';
import { RouterModule } from "@angular/router";

@NgModule({
    declarations:[SubordinateSelectionComponent, CRUDComponent],
    exports:[
      SharedModule,
      RouterModule,
      SubordinateSelectionComponent,
      CRUDComponent
    ],
    imports:[
      SharedModule,
      RouterModule,
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
    ]
  })
export class CommonComponentsModule{
}

