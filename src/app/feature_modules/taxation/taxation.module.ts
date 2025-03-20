import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { TaxationComponent } from './taxation.component';
import { CommonComponentsModule } from '../../common/commonComponents.module';
import { TaxSectionComponent } from './tax-section/tax-section.component';
import { TaxDeclarationComponent } from './tax-declaration/tax-declaration.component';
import { TaxationRoutingModule } from './taxation-routing.module';
import { EditTaxComponent } from './tax/edit-tax/edit-tax.component';
import { TaxCalculatorComponent } from './tax/tax-calculator/tax-calculator.component';
import { RentInformationComponent } from './tax/edit-tax/rent-information/rent-information.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaxComponent } from './tax/tax.component';
import { UserTaxDeclarationComponent } from './user-tax-declaration/user-tax-declaration.component';
import { TaxComponentsComponent } from './tax/edit-tax/tax-components/tax-components.component';
import { TaxComponentBySectionComponent } from './tax-component-by-section/tax-component-by-section.component';

@NgModule({
  declarations: [
    TaxationComponent,
    UserTaxDeclarationComponent,
    TaxComponent,
    EditTaxComponent,
    TaxCalculatorComponent,
    RentInformationComponent,
    TaxSectionComponent,
    TaxDeclarationComponent,
    TaxComponentsComponent,
    TaxComponentBySectionComponent
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    TaxationRoutingModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class TaxationModule { }
