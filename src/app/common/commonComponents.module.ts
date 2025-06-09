import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { SubordinateSelectionComponent } from "./subordinateSelection/subordinateSelection.component";
import { CRUDComponent } from './crud/crud.component';
import { RouterModule } from "@angular/router";
import { LanguageSelectorComponent } from "./language-selector/language-selector.component";
import { HrmTableComponent } from "./hrm-table/hrm-table.component";

@NgModule({
    declarations:[SubordinateSelectionComponent, CRUDComponent, LanguageSelectorComponent, HrmTableComponent],
    exports:[
      SharedModule,
      RouterModule,
      SubordinateSelectionComponent,
      CRUDComponent,
      LanguageSelectorComponent,
      HrmTableComponent
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

