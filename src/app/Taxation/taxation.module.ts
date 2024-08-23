import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaxationComponent } from './taxation.component';
import { TaxComponentsComponent } from './tax-components/tax-components.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.Module';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { TaxSectionComponent } from './tax-section/tax-section.component';
import { TaxDeclarationComponent } from './tax-declaration/tax-declaration.component';



@NgModule({
  declarations: [
    TaxationComponent,
    TaxComponentsComponent,
    TaxSectionComponent,
    TaxDeclarationComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    CommonComponentsModule
  ]
})
export class TaxationModule { }
