import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from '../users/user-list/user-list.component';
import { ProjectListComponent } from '../Project/project-list/project-list.component';
import { TasksComponent } from '../tasks/tasks.component';
import { TeammembersComponent } from './teammembers/teammembers.component';
import { EmailTemplateComponent } from '../email-template/email-template.component';
import { TagComponent } from '../tasks/task.tag/tag.component';
import { ManageComponent } from './manage/manage.component';
import { AuthGuard } from '../auth.guard';
import { RequestManualTimeComponent } from '../manualTime/request-manual-time/request-manual-time.component';


const routes: Routes = [
  {
    path: '', 
    component: ManageComponent, 
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'employees', pathMatch: 'full' },
      {
        path: 'employees',
        component: UserListComponent,
        children: [
          {
            path: 'employee-settings',
            loadChildren: () => import('../users/employee-settings/employee-settings-routing.module')
              .then(m => m.EmployeeSettingsRoutingModule)
          }
        ]
      },
      { path: 'projects', component: ProjectListComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'team-members', component: TeammembersComponent },
      { path: 'email-templates', component: EmailTemplateComponent },
      { path: 'tags', component: TagComponent },
      { path: 'manual-time-requests', component: RequestManualTimeComponent },
    ]
  }
];

// const routes: Routes = [
//   {
//     path: '', component: HomeComponent, canActivate: [AuthGuard],
//     children: [
//       {
//         path: 'manage', component: ManageComponent, canActivate: [AuthGuard],
//         children: [
//           { path: 'manage', redirectTo: 'employees', pathMatch: 'full' },
//           {
//             path: 'employees',
//             component: UserListComponent,
//             children: [
//               {
//                 path: 'employee-settings',
//                 loadChildren: () => import('../users/employee-settings/employee-settings-routing.module').then(m => m.EmployeeSettingsRoutingModule)
//               }
//             ]
//           },
//           { path: 'projects', component: ProjectListComponent },
//           { path: 'tasks', component: TasksComponent },
//           { path: 'team-members', component: TeammembersComponent },
//           { path: 'email-templates', component: EmailTemplateComponent },
//           { path: 'tags', component: TagComponent },
//           { path: 'manual-time-requests', component: RequestManualTimeComponent },
//         ]
//       }
//     ]
//   }
// ];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoutingModule { }
