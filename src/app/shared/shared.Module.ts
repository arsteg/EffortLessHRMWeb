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
import { MatInputModule  } from "@angular/material/input";
import { CommonModule } from "@angular/common";
import { MatSelectModule  } from '@angular/material/select';
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
import { MatStepperModule }  from '@angular/material/stepper';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { PaginationComponent } from '../pagination/pagination.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@NgModule({
  declarations: [SortDirective, SearchPipe, MilliSecondsToTimePipe, PaginationComponent],
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
    MatTooltipModule,
    MatAutocompleteModule
  ],
  exports: [
    SortDirective,
    CdkTableModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
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
    BsDatepickerModule,
    MatSortModule,
    ToastrModule,
    MilliSecondsToTimePipe,
    MatFormFieldModule,
    MatStepperModule,
    MatDialogModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    TooltipModule,
    MatTooltipModule,
    PaginationComponent,
    MatAutocompleteModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
})
export class SharedModule { }