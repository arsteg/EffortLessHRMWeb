import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeparationComponent } from './separation.component';

const routes: Routes = [
    {path: '', component: SeparationComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SeparationRoutingModule { }
