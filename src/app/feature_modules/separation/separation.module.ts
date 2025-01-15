import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SeparationComponent } from './separation.component';
import { SeparationRoutingModule } from './separation-routing.module';
import { ResignationComponent } from './resignation/resignation.component';
import { TerminationComponent } from './termination/termination.component';

@NgModule({
  declarations: [
    SeparationComponent,
    ResignationComponent,
    TerminationComponent
  ],
  imports: [
    CommonModule,
    SeparationRoutingModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
    MatNativeDateModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class SeparationModule { }
