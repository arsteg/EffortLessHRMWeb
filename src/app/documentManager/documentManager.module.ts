import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { RouterModule } from '@angular/router';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { CompanyPolicyDocumentComponent } from "./companyPolicy/companyPolicyDocument.component";
import { DocumentManagerComponent } from "./documentManager.component";
import { DocumentCategoryComponent } from "./document/documentCategory/documentCategory.component";
import { DocumentComponent } from "./document/document.component";
import { UserDocumentComponent } from "./document/userDocument/userDocument.component";
import { DocumentTemplateComponent } from "./template/documentTemplate.component";
import { QuillModule } from 'ngx-quill';

@NgModule({
    declarations:[DocumentManagerComponent, CompanyPolicyDocumentComponent,
      DocumentCategoryComponent,DocumentComponent,UserDocumentComponent,
      DocumentTemplateComponent],
    exports:[CompanyPolicyDocumentComponent,DocumentManagerComponent,
      DocumentCategoryComponent,DocumentComponent,UserDocumentComponent,
      DocumentTemplateComponent],
    imports:[SharedModule,
      RouterModule,
      MatFormFieldModule,
      MatDatepickerModule,
      MatButtonModule,
      MatInputModule,
      MatRippleModule,
      MatNativeDateModule,
      MatRippleModule,
      NgxChartsModule,
      FormsModule,
      QuillModule.forRoot()
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
    ]
  })
export class DocumentManagementModule{
}

