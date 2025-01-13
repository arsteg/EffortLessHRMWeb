import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeparationComponent } from './separation.component';
import { ResignationComponent } from './resignation/resignation.component';
import { TerminationComponent } from './termination/termination.component';
import { AuthGuard } from 'src/app/auth.guard';

const routes: Routes = [
    {
        path: '', component: SeparationComponent, canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: (localStorage.getItem('adminView') === 'user') ? 'resignation' : 'termination',
                pathMatch: 'full'
            },
            { path: 'resignation', component: ResignationComponent },
            { path: 'termination', component: TerminationComponent }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SeparationRoutingModule { }
