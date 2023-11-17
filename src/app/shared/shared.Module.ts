import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgModule } from "@angular/core";
import { SortDirective } from "../directive/sort.directive";
import { CdkTableModule } from '@angular/cdk/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { SearchPipe } from "./search.pipe";
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { CommonModule } from "@angular/common";
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { MatSortModule } from '@angular/material/sort';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { MilliSecondsToTimePipe } from '../pipes/SecondsToTimePipe';

@NgModule({
  declarations: [SortDirective, SearchPipe, MilliSecondsToTimePipe],
  imports: [
    CommonModule,
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
    BsDatepickerModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    AgGridModule.withComponents([]),
    BsDatepickerModule.forRoot(),
    MatTooltipModule,
    MatSortModule,
    TooltipModule,
    ToastrModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRippleModule
  ],
  exports: [
    SortDirective,
    CdkTableModule,
    NgxPaginationModule,
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
    MatSelectModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    SearchPipe,
    CommonModule,
    BsDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridModule,
    BsDatepickerModule,
    MatSortModule,
    ToastrModule,
    MilliSecondsToTimePipe,
    MatFormFieldModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
})
export class SharedModule { }
