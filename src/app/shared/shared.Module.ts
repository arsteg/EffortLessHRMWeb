import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgModule } from "@angular/core";
import { SortDirective } from "../directive/sort.directive";
import { CdkTableModule } from '@angular/cdk/table';

import { SearchPipe } from "./search.pipe";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from "@angular/common";
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSortModule } from '@angular/material/sort';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { MilliSecondsToTimePipe } from '../pipes/SecondsToTimePipe';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { PaginationComponent } from '../pagination/pagination.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule }from '@angular/material/card';
import {MAT_DATE_FORMATS} from '@angular/material/core';
import { EffortlessTranslateModule } from '../translate/translate.module';
import {TranslateModule} from '@ngx-translate/core';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',  // for parsing input string
  },
  display: {
    dateInput: 'YYYY-MM-DD',  // for displaying the input field
    monthYearLabel: 'MMM YYYY', // e.g., "Jan 2025"
    dateA11yLabel: 'LL', // accessibility
    monthYearA11yLabel: 'MMMM YYYY',
  }
};
@NgModule({
  declarations: [SortDirective, SearchPipe, MilliSecondsToTimePipe, PaginationComponent],
  imports: [
    CommonModule,
    MatMenuModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    MatTooltipModule,
    MatSortModule,
    TooltipModule,
    ToastrModule.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    MatRippleModule,
    MatStepperModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatAutocompleteModule,
    MatSlideToggleModule,
    CdkTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatDialogModule,
    NgxChartsModule,
    TranslateModule,
  ],
  exports: [
    CommonModule,
    MatMenuModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    BsDatepickerModule,
    MatTooltipModule,
    MatSortModule,
    TooltipModule,
    ToastrModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRippleModule,
    MatStepperModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatAutocompleteModule,
    MatSlideToggleModule,
    CdkTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatDialogModule,
    NgxChartsModule,
    TranslateModule,
    SortDirective, SearchPipe, MilliSecondsToTimePipe, PaginationComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
  ]
})
export class SharedModule { }