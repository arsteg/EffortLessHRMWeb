import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
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

