import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgModule } from "@angular/core";
import { SortDirective } from "../directive/sort.directive";
import { CdkTableModule } from '@angular/cdk/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { SearchPipe } from "./search.pipe";
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from "@angular/common";
import {MatSelectModule} from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations:[SortDirective,SearchPipe],
  imports:[
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
    MatSortModule
    ],
  exports:[
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
    MatSortModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
})
export class SharedModule {}
